import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { KeyService } from './key.service';

@Module({
  imports: [TypeOrmModule.forFeature([KeyPair])],
  providers: [KeyService],
  exports: [KeyService]
})
export class KeyModule {}
