/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { KeyController } from './key.controller';
import { KeyService } from './key.service';

describe('KeyController', () => {
  let controller: KeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyController],
      providers: [
        {
          provide: KeyService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<KeyController>(KeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
