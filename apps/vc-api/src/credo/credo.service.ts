// IMPORTANT: '@openwallet-foundation/askar-nodejs' must be imported before any
// '@credo-ts/*' package. Importing it registers the native askar binding on
// the (CommonJS) '@openwallet-foundation/askar-shared' package; the ESM-only
// Credo packages snapshot that binding when they load, so loading Credo first
// leaves them with an unregistered (undefined) binding.
import { askar } from '@openwallet-foundation/askar-nodejs';
import { AskarModule, AskarStoreManager } from '@credo-ts/askar';
import { Agent } from '@credo-ts/core';
import { agentDependencies } from '@credo-ts/node';
import { Session } from '@openwallet-foundation/askar-shared';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CredoService implements OnModuleInit, OnModuleDestroy {
  private readonly askarAgent: Agent<{ askar: AskarModule }>;
  private initialized = false;

  constructor(private configService: ConfigService) {
    // Create the agent. Since Credo 0.6 the store configuration lives on the
    // Askar module rather than the agent config ("walletConfig").
    this.askarAgent = new Agent({
      config: {
        // Migrates records of pre-0.6 stores on first startup
        autoUpdateStorageOnStartup: true
      },
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({
          askar,
          store: {
            id: this.configService.get<string>('CREDO_WALLET_ID'),
            key: this.configService.get<string>('CREDO_WALLET_KEY'),
            database: {
              type: 'sqlite',
              config: {
                path: `${this.configService.get<string>('DB_BASE_PATH')}/${this.configService.get<string>(
                  'CREDO_WALLET_ID'
                )}/sqlite.db`
              }
            }
          }
        })
      }
    });
  }

  async onModuleInit() {
    // This method is called after the module is initialized
    await this.initialize();
  }

  // initializes the askar agent for operations
  private async initialize() {
    if (!this.askarAgent.isInitialized) {
      await this.askarAgent.initialize();
    }
    this.initialized = true;
  }

  // Accessor for the agent
  public get agent(): Agent<{ askar: AskarModule }> {
    if (!this.initialized) {
      throw new Error('Credo Agent is not initialized yet.');
    }
    return this.askarAgent;
  }

  /**
   * Run a callback with a raw Askar session.
   *
   * The Credo 0.6+ KMS API intentionally has no private-key export, but this
   * API exposes key export (see the key module). Going through the Askar
   * store directly keeps that behaviour; it also couples the key module to
   * the Askar backend.
   */
  public async withAskarSession<Return>(callback: (session: Session) => Return): Promise<Awaited<Return>> {
    const storeManager = this.agent.dependencyManager.resolve(AskarStoreManager);
    return await storeManager.withSession(this.askarAgent.context, callback);
  }

  async onModuleDestroy() {
    // This will be called when the module is destroyed
    await this.cleanup();
  }

  private async cleanup() {
    if (this.askarAgent.isInitialized) {
      // the agent owns the store lifecycle since Credo 0.6
      await this.askarAgent.shutdown();
    }
  }
}
