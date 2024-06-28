import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { DOOR_STATUS } from "./dtos/door.status.enum";
import { DropKeyRequestDto } from "./dtos/drop-key.request.dto";
import { DropKeyResponseDto } from "./dtos/drop-key.response.dto";
import { KEY_STATUS } from "./dtos/key.status.enum";
import { TakeKeyRequestDto } from "./dtos/take-key.request.dto";
import { TakeKeyResponseDto } from "./dtos/take-key.response.dto";

const prisma = new PrismaClient();

@Injectable()
export class KeyService {
  async takeKey(
    takeKeyRequestDto: TakeKeyRequestDto,
  ): Promise<TakeKeyResponseDto> {
    const rfidSerialNo = await this.findKey(
      takeKeyRequestDto.room_no,
      takeKeyRequestDto.building_location,
    );

    const keyStatus = await this.checkKeyStatus(rfidSerialNo);

    if (keyStatus === KEY_STATUS.NOT_EXIST) {
      throw new NotFoundException("Key Not Exist");
    }

    console.info("아두이노 통신을 진행합니다.");
    console.info("DOOR 상태를 확인합니다.");

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

  async dropKey(
    dropKeyRequestDto: DropKeyRequestDto,
  ): Promise<DropKeyResponseDto> {
    const rfidSerialNo = await this.findKey(
      dropKeyRequestDto.room_no,
      dropKeyRequestDto.building_location,
    );

    console.info("아두이노 통신을 진행합니다.");
    console.info("RFID, DOOR 상태를 확인합니다.");

    await prisma.status.create({
      data: {
        rfidSerialNo: rfidSerialNo,
        keyStatus: KEY_STATUS.EXIST,
        doorStatus: DOOR_STATUS.CLOSE,
      },
    });

    return {
      "door_status": true,
    };
  }

  async doorStatus(rfidSerialNo: string) {
    const doorStatus = await this.checkDoorStatus(rfidSerialNo);

    if (doorStatus === DOOR_STATUS.CLOSE) {
      return false;
    }

    if (doorStatus === DOOR_STATUS.OPEN) {
      return true;
    }
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

  async checkKeyStatus(rfidSerialNo: string) {
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

  async checkDoorStatus(rfidSerialNo: string) {
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
