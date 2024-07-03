import { Module } from "@nestjs/common";
import { MqttService } from "../mqtt/mqtt.service";
import { KeyController } from "./key.controller";
import { KeyService } from "./key.service";

@Module({
  providers: [KeyService, MqttService],
  controllers: [KeyController],
})
export class KeyModule {}
