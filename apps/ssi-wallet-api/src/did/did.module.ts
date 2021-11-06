import { Module } from '@nestjs/common';
import { KeyModule } from '../key/key.module';

@Module({
  imports: [KeyModule]
})
export class DidModule {}
