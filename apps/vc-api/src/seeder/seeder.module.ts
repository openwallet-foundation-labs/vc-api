import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { KeyPair } from '../key/key-pair.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';

@Module({
  imports: [TypeOrmModule.forFeature([KeyPair]), DidModule],
  providers: [SeederService]
})
export class SeederModule {}
