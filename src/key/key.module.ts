import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { KeyController } from './key.controller';

@Module({
  providers: [KeyService],
  controllers: [KeyController]
})
export class KeyModule {}
