import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { DropKeyRequestDto } from "./dtos/drop-key.request.dto";
import { DropKeyResponseDto } from "./dtos/drop-key.response.dto";
import { TakeKeyRequestDto } from "./dtos/take-key.request.dto";
import { TakeKeyResponseDto } from "./dtos/take-key.response.dto";
import { KeyService } from "./key.service";

@Controller("/api")
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Post("/take-key")
  async takeKey(
    @Body() takeKeyRequestDto: TakeKeyRequestDto,
  ): Promise<TakeKeyResponseDto> {
    try {
      return await this.keyService.takeKey(takeKeyRequestDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post("/drop-key")
  async dropKey(
    @Body() dropKeyRequestDto: DropKeyRequestDto,
  ): Promise<DropKeyResponseDto> {
    try {
      return await this.keyService.dropKey(dropKeyRequestDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
