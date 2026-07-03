import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowEntity } from './entities/workflow.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowRequestDto } from './dtos/create-workflow-request.dto';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { CreateExchangeSuccessDto } from './dtos/create-exchange-success.dto';
import { WfExchangeEntity } from './entities/wf-exchange.entity';
import { CreateWorkflowSuccessDto } from './dtos/create-workflow-success.dto';
import { ExchangeStateDto } from './dtos/exchange-state.dto';
import { VerifiablePresentationDto } from '../credentials/dtos/verifiable-presentation.dto';
import { VpSubmissionVerifierService } from './vp-submission-verifier.service';
import { ExchangeResponseDto } from './dtos/exchange-response.dto';
import { CallbackDto } from './dtos/callback.dto';
import { HttpService } from '@nestjs/axios';
import { validate } from 'class-validator';
import { ExchangeStepStateDto } from './dtos/exchange-step-state.dto';
import { API_DEFAULT_VERSION_PREFIX } from '../../setup';
import { SubmissionReviewDto } from './dtos/submission-review.dto';
import { IssuanceExchangeStep } from './types/issuance-exchange-step';

export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name, { timestamp: true });
  private readonly baseUrlWithControllerPath: string;

  constructor(
    private vpSubmissionVerifierService: VpSubmissionVerifierService,
    @InjectRepository(WorkflowEntity)
    private workflowRepository: Repository<WorkflowEntity>,
    @InjectRepository(WfExchangeEntity)
    private exchangeRepository: Repository<WfExchangeEntity>,
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    const baseUrl = this.configService.get('BASE_URL');
    const removeTrailingSlash = (str) => (str.endsWith('/') ? str.slice(0, -1) : str);
    const baseWithControllerPath = `${removeTrailingSlash(baseUrl)}${API_DEFAULT_VERSION_PREFIX}/vc-api`;
    this.baseUrlWithControllerPath = baseWithControllerPath;
  }

  public async createWorkflow(
    createWorkflowRequestDto: CreateWorkflowRequestDto
  ): Promise<CreateWorkflowSuccessDto> {
    if (await this.workflowRepository.findOneBy({ workflowId: createWorkflowRequestDto.config.id })) {
      throw new ConflictException(`workflowId='${createWorkflowRequestDto.config.id}' already exists`);
    }
    const workflow = new WorkflowEntity(createWorkflowRequestDto.config);
    await this.workflowRepository.save(workflow);
    createWorkflowRequestDto.config.id = workflow.workflowId;
    return createWorkflowRequestDto;
  }

  public async getWorkflow(localWorkflowId: string): Promise<CreateWorkflowSuccessDto> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: localWorkflowId });
    if (workflow == null) {
      throw new NotFoundException(`workflowId='${localWorkflowId}' does not exist`);
    }
    const workflowResponse: CreateWorkflowSuccessDto = {
      config: {
        steps: workflow.workflowSteps,
        initialStep: workflow.initialStep,
        id: workflow.workflowId
      }
    };
    return workflowResponse;
  }

  public async createExchange(
    localWorkflowId: string,
    _createExchangeDto?: CreateExchangeDto
  ): Promise<CreateExchangeSuccessDto> {
    const workflow = await this.workflowRepository.findOneBy({ workflowId: localWorkflowId });
    if (workflow == null) {
      throw new NotFoundException(`workflowId='${localWorkflowId}' does not exist`);
    }
    const firstStep = workflow.getInitialStep();
    const exchange = new WfExchangeEntity(
      localWorkflowId,
      firstStep,
      workflow.initialStep,
      this.baseUrlWithControllerPath
    );
    await this.exchangeRepository.save(exchange);
    const localExchangeId = exchange.exchangeId;
    const exchangeId = `${this.baseUrlWithControllerPath}/workflows/${localWorkflowId}/exchanges/${localExchangeId}`;
    return {
      exchangeId: exchangeId,
      step: workflow.initialStep,
      state: exchange.state
    };
  }

  public async getExchangeState(localWorkflowId: string, localExchangeId: string): Promise<ExchangeStateDto> {
    const exchange = await this.exchangeRepository.findOneBy({
      workflowId: localWorkflowId,
      exchangeId: localExchangeId
    });
    if (exchange == null) {
      throw new NotFoundException(`exchangeId='${localExchangeId}' does not exist`);
    }
    return {
      exchangeId: localExchangeId,
      step: exchange.getCurrentStep().stepId,
      state: exchange.state
    };
  }

  public async participateInExchange(
    localWorkflowId: string,
    localExchangeId: string,
    requestUrl: string,
    presentation?: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> {
    const exchange = await this.exchangeRepository.findOneBy({
      workflowId: localWorkflowId,
      exchangeId: localExchangeId
    });
    if (exchange == null) {
      throw new NotFoundException(`exchangeId='${localExchangeId}' does not exist`);
    }
    // From: https://w3c-ccg.github.io/vc-api/#participate-in-an-exchange
    // "Posting an empty body will start the exchange or return what the exchange is expecting to complete the next step."
    if (presentation === undefined) {
      return exchange.getExchangeResponse();
    }

    const workflow = await this.workflowRepository.findOneBy({ workflowId: localWorkflowId });
    if (workflow == null) {
      throw new NotFoundException(`workflowId='${localWorkflowId}' does not exist`);
    }
    const currentStep = exchange.getCurrentStep();
    const [nextStepDefinition, nextStepId] = workflow.getNextStep(currentStep.stepId);
    const exchangeRepsonse = await exchange.participateInExchange(
      presentation,
      this.vpSubmissionVerifierService,
      nextStepDefinition,
      nextStepId,
      this.baseUrlWithControllerPath
    );

    if (exchangeRepsonse.errors.length > 0) {
      throw new BadRequestException(exchangeRepsonse.errors);
    }

    await this.exchangeRepository.save(exchange);
    const stepResult = exchange.getStep(currentStep.stepId);
    this.logger.debug(
      `workflow: ${localWorkflowId}, exchange: ${localExchangeId}, step: ${currentStep.stepId}`
    );
    const body = CallbackDto.toDto(stepResult);
    body.exchangeId = requestUrl;

    const validationErrors = await validate(body, {
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: false // here we want properties not defined in the CallbackDto to be just stripped out and not sent to a callback endpoint
    });

    if (validationErrors.length > 0) {
      this.logger.error('\n' + validationErrors.map((e) => e.toString()).join('\n\n'));
      throw new Error(validationErrors.toString());
    }

    Promise.all(
      stepResult.callback?.map(async (callback) => {
        try {
          await this.httpService.axiosRef.post(callback.url, body);
          this.logger.log(`callback submitted: ${callback.url}`);
        } catch (err) {
          this.logger.error(`error calling callback (${callback.url}): ${err}`);
        }
      })
    ).catch((err) => this.logger.error(err));
    // TODO: decide how to change logic here to handle callback error
    return exchangeRepsonse.response;
  }

  public async getExchangeStep(
    localWorkflowId: string,
    localExchangeId: string,
    localStepId: string
  ): Promise<ExchangeStepStateDto> {
    const exchange = await this.exchangeRepository.findOneBy({
      workflowId: localWorkflowId,
      exchangeId: localExchangeId
    });
    if (exchange == null) {
      throw new NotFoundException(`exchangeId='${localExchangeId}' does not exist`);
    }

    const stepInfo = exchange.getStep(localStepId);
    const response = stepInfo.getStepResponse();
    return {
      exchangeId: localExchangeId,
      stepId: localStepId,
      step: stepInfo,
      stepResponse: response
    };
  }

  public async addReview(
    localWorkflowId: string,
    localExchangeId: string,
    localStepId: string,
    reviewDto: SubmissionReviewDto
  ) {
    const exchange = await this.exchangeRepository.findOneBy({
      workflowId: localWorkflowId,
      exchangeId: localExchangeId
    });
    if (exchange == null) {
      throw new NotFoundException(
        `workflowId='${localWorkflowId} -> 'exchangeId='${localExchangeId}' does not exist`
      );
    }

    const stepInfo = exchange.getStep(localStepId);

    if (stepInfo instanceof IssuanceExchangeStep) {
      stepInfo.addVP(reviewDto.vp);
    } else {
      throw new BadRequestException('Only Issuance exchange step is supported');
    }
    const id = exchange.steps.findIndex((step) => step.stepId === localStepId);
    exchange.steps[id] = stepInfo;
    await this.exchangeRepository.save(exchange);
  }
}
