import { Controller, Get, Param } from "@nestjs/common";
import { MqttService } from "./mqtt.service";

@Controller("mqtt")
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Get("/key")
  async keyRequest(): Promise<void> {
    await this.mqttService.publish("stevia-mqtt/hbnu/request/key", "req");
  }

  @Get("/door")
  async doorRequest(): Promise<void> {
    await this.mqttService.publish("stevia-mqtt/hbnu/request/door", "req");
  }

  @Get("/lock")
  async lockRequest(): Promise<void> {
    await this.mqttService.publish("stevia-mqtt/hbnu/request/lock", "on");
  }
}
