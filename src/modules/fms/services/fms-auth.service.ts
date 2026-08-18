import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsLoginDto, FmsLogoutDto } from '../dto/fms-auth.dto';
import { FmsLoginResponse, FmsLogoutResponse } from '../interfaces/fms.interfaces';

@Injectable()
export class FmsAuthService {
  private readonly logger = new Logger(FmsAuthService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Authenticates operator/admin. Maps client IP to active pumps in mapping_ip,
   * verifies shift, and enables dispenser authorization flags.
   *
   * Endpoint: POST /Login
   */
  async login(dto: FmsLoginDto): Promise<FmsLoginResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      UserId: dto.UserId,
      Password: dto.Password,
    };
    this.logger.log(`Logging in FMS user: ${dto.UserId}`);
    return this.client.post<FmsLoginResponse>('/Login', payload);
  }

  /**
   * Logs out operator or admin, revokes pump authorizations, and records logout event.
   *
   * Endpoint: POST /Logout
   */
  async logout(dto: FmsLogoutDto): Promise<FmsLogoutResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      UserId: dto.UserId,
      ...(dto.Password ? { Password: dto.Password } : {}),
    };
    this.logger.log(`Logging out FMS user: ${dto.UserId}`);
    return this.client.post<FmsLogoutResponse>('/Logout', payload);
  }
}
