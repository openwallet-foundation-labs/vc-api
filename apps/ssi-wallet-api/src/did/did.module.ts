import { Module } from '@nestjs/common';
import { KeyModule } from 'src/key/key.module';

@Module({
  imports: [KeyModule]
})
export class DidModule {}
