import { DOOR_STATUS } from "./door.status.enum";

export class DropKeyResponseDto {
  door_status: DOOR_STATUS | boolean;
}
