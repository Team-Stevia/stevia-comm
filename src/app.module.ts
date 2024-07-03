import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { KeyModule } from "./key/key.module";
import { MqttModule } from "./mqtt/mqtt.module";

@Module({
  imports: [KeyModule, MqttModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
