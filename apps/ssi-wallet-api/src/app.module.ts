import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DidController } from './did/did.controller';
import { DidService } from './did/did.service';
import { KeyService } from './key/key.service';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';

@Module({
  imports: [ConfigModule.forRoot(), KeyModule, DidModule],
  controllers: [AppController, DidController],
  providers: [AppService, DidService, KeyService]
})
export class AppModule {}
