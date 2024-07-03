import { Module } from "@nestjs/common";
import { MqttController } from "./mqtt.controller";
import { MqttService } from "./mqtt.service";

@Module({
  providers: [MqttService],
  controllers: [MqttController],
})
export class MqttModule {}
