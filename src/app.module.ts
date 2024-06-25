import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeyModule } from './key/key.module';

@Module({
  imports: [KeyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
