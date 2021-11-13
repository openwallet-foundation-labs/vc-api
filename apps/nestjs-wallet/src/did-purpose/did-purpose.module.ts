import { Module } from '@nestjs/common';
import { DIDPurposeController } from './did-purpose.controller';

/**
 * A DID purpose could be for exemple to accept all VC signed by a DID, or only accept a subset of credentials like "battery to grid"
 * TODO: determine how a "purpose" is created? What does a purpose consist of?
 */
@Module({
  controllers: [DIDPurposeController]
})
export class DIDPurposeModule {}
