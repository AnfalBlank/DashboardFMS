import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsAddUserDto, FmsDeleteUserDto } from '../dto/fms-user.dto';
import {
  FmsListUserResponse,
  FmsAddUserResponse,
  FmsDeleteUserResponse,
} from '../interfaces/fms.interfaces';

@Injectable()
export class FmsUserService {
  private readonly logger = new Logger(FmsUserService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Lists all users with their roles (RoleId 2=Operator, 3=Admin).
   *
   * Endpoint: POST /user/List_user
   */
  async listUsers(): Promise<FmsListUserResponse> {
    return this.client.post<FmsListUserResponse>('/user/List_user', {});
  }

  /**
   * Adds a user with password hashed on the controller.
   *
   * Endpoint: POST /user/Add_user
   */
  async addUser(dto: FmsAddUserDto): Promise<FmsAddUserResponse> {
    const payload = {
      NamaUser: dto.NamaUser,
      Password: dto.Password,
      RoleId: String(dto.RoleId),
      IpAddress: dto.IpAddress,
    };
    this.logger.log(`Adding FMS user: ${dto.NamaUser} (RoleId: ${dto.RoleId})`);
    return this.client.post<FmsAddUserResponse>('/user/Add_user', payload);
  }

  /**
   * Deletes a user account by username.
   *
   * Endpoint: POST /user/Delete_user
   */
  async deleteUser(dto: FmsDeleteUserDto): Promise<FmsDeleteUserResponse> {
    const payload = {
      NamaUser: dto.NamaUser,
    };
    this.logger.log(`Deleting FMS user: ${dto.NamaUser}`);
    return this.client.post<FmsDeleteUserResponse>('/user/Delete_user', payload);
  }
}
