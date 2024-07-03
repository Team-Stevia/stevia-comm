import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { MqttService } from "../mqtt/mqtt.service";
import { DropKeyRequestDto } from "./dtos/drop-key.request.dto";
import { DropKeyResponseDto } from "./dtos/drop-key.response.dto";
import { KeyStatusResponseDto } from "./dtos/key.status.response.dto";
import { TakeKeyRequestDto } from "./dtos/take-key.request.dto";
import { TakeKeyResponseDto } from "./dtos/take-key.response.dto";
import { KeyService } from "./key.service";

@Controller("/api/keys")
export class KeyController {
  constructor(
    private readonly keyService: KeyService,
    private readonly mqttService: MqttService,
  ) {}

  @Get("/:reserve-id")
  async keyStatus(
    @Param("reserve-id") reserveId: string,
  ): Promise<KeyStatusResponseDto> {
    try {
      return await this.keyService.keyStatus(reserveId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post("/take-key")
  async takeKey(
    @Body() takeKeyRequestDto: TakeKeyRequestDto,
  ): Promise<TakeKeyResponseDto> {
    try {
      await this.keyService.checkDatabaseBeforeTakeKey(takeKeyRequestDto);
      await this.mqttService.publish("stevia-mqtt/hbnu/request/lock", "on");
      return await this.keyService.takeKeyUpdateDb(takeKeyRequestDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post("/drop-key")
  async dropKey(
    @Body() dropKeyRequestDto: DropKeyRequestDto,
  ): Promise<DropKeyResponseDto> {
    try {
      await this.mqttService.publish("stevia-mqtt/hbnu/request/key", "req");
      const rfidSerialNo: string = await this.mqttService.getMessage();

      console.info(rfidSerialNo);

      if (rfidSerialNo === "No NFC card detected") {
        new NotFoundException("Key Not Exists");
      }

      await this.keyService.dropKeyExistCheck(dropKeyRequestDto, rfidSerialNo);

      await this.mqttService.publish("stevia-mqtt/hbnu/request/door", "req");
      const doorStatusMessage: string = await this.mqttService.getMessage();

      console.info(doorStatusMessage);

      if (doorStatusMessage === "Door Not Closed") {
        new NotFoundException("Door Not Closed");
      }

      return await this.keyService.dropKeyUpdateDb(rfidSerialNo);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
