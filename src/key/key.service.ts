import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { DOOR_STATUS } from "./dtos/door.status.enum";
import { DropKeyRequestDto } from "./dtos/drop-key.request.dto";
import { DropKeyResponseDto } from "./dtos/drop-key.response.dto";
import { KEY_STATUS } from "./dtos/key.status.enum";
import { KeyStatusResponseDto } from "./dtos/key.status.response.dto";
import { TakeKeyRequestDto } from "./dtos/take-key.request.dto";
import { TakeKeyResponseDto } from "./dtos/take-key.response.dto";

const prisma = new PrismaClient();

@Injectable()
export class KeyService {
  async checkDatabaseBeforeTakeKey(
    takeKeyRequestDto: TakeKeyRequestDto,
  ): Promise<void> {
    const rfidSerialNo = await this.findKey(
      takeKeyRequestDto.room_no,
      takeKeyRequestDto.building_location,
    );

    const keyStatus = await this.checkDBKeyStatus(rfidSerialNo);

    if (keyStatus === KEY_STATUS.NOT_EXIST) {
      throw new NotFoundException("Key Not Exist");
    }
  }

  async takeKeyUpdateDb(
    takeKeyRequestDto: TakeKeyRequestDto,
  ): Promise<TakeKeyResponseDto> {
    const rfidSerialNo = await this.findKey(
      takeKeyRequestDto.room_no,
      takeKeyRequestDto.building_location,
    );

    await prisma.status.create({
      data: {
        rfidSerialNo: rfidSerialNo,
        keyStatus: KEY_STATUS.NOT_EXIST,
        doorStatus: DOOR_STATUS.OPEN,
      },
    });

    return {
      "door_status": false,
    };
  }

  async dropKeyExistCheck(
    dropKeyRequestDto: DropKeyRequestDto,
    scannedRfidSerialNo: string,
  ): Promise<void> {
    const rfidSerialNo = await this.findKey(
      dropKeyRequestDto.room_no,
      dropKeyRequestDto.building_location,
    );

    if (scannedRfidSerialNo !== rfidSerialNo) {
      throw new NotFoundException("Wrong Key Exists");
    }
  }

  async dropKeyUpdateDb(
    scannedRfidSerialNo: string,
  ): Promise<DropKeyResponseDto> {
    await prisma.status.create({
      data: {
        rfidSerialNo: scannedRfidSerialNo,
        keyStatus: KEY_STATUS.EXIST,
        doorStatus: DOOR_STATUS.CLOSE,
      },
    });

    return {
      "door_status": true,
    };
  }

  async keyStatus(rfidSerialNo: string): Promise<KeyStatusResponseDto> {
    const keyStatus = await this.checkDBKeyStatus(rfidSerialNo);

    if (keyStatus === KEY_STATUS.NOT_EXIST) {
      return {
        key_status: false,
      };
    }

    if (keyStatus === KEY_STATUS.EXIST) {
      return {
        key_status: true,
      };
    }

    throw new NotFoundException("Key Status Check Error");
  }

  async findKey(roomNo: number, buildingLocation: string): Promise<string> {
    const rfidSerialNo = await prisma.key.findFirst({
      where: {
        roomNo: roomNo,
        buildingLocation: buildingLocation,
      },
      select: {
        rfidSerialNo: true,
      },
    });

    if (!rfidSerialNo) {
      throw new NotFoundException("Key Not Found");
    }

    return rfidSerialNo.rfidSerialNo;
  }

  async checkDBKeyStatus(rfidSerialNo: string) {
    const keyStatus = await prisma.status.findFirst({
      where: {
        rfidSerialNo: rfidSerialNo,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        keyStatus: true,
      },
    });

    if (!keyStatus) {
      throw new NotFoundException("Key Status Check Error");
    }

    return keyStatus.keyStatus;
  }

  async checkDBDoorStatus(rfidSerialNo: string) {
    const keyStatus = await prisma.status.findFirst({
      where: {
        rfidSerialNo: rfidSerialNo,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        doorStatus: true,
      },
    });

    if (!keyStatus) {
      throw new NotFoundException("Door Status Check Error");
    }

    return keyStatus.doorStatus;
  }
}
