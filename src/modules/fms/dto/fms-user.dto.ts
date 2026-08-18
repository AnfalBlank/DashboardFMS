import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FmsListUserDto {
  // Empty payload object per API specification
}

export class FmsAddUserDto {
  @ApiProperty({ example: 'operator2', description: 'Username for the operator or admin' })
  @IsNotEmpty()
  @IsString()
  NamaUser: string;

  @ApiProperty({ example: 'OperatorPass123', description: 'Plaintext password (hashed by controller)' })
  @IsNotEmpty()
  @IsString()
  Password: string;

  @ApiProperty({ example: '2', description: 'Role ID: 2 = Operator, 3 = Admin' })
  @IsNotEmpty()
  RoleId: string | number;

  @ApiProperty({ example: '192.168.1.50', description: 'IP address allowed for the operator' })
  @IsNotEmpty()
  @IsString()
  IpAddress: string;
}

export class FmsDeleteUserDto {
  @ApiProperty({ example: 'operator2', description: 'Username of the user account to delete' })
  @IsNotEmpty()
  @IsString()
  NamaUser: string;
}
