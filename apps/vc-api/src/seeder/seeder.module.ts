import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { KeyPair } from '../key/key-pair.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([KeyPair])],
  providers: [SeederService]
})
export class SeederModule {}
