import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FmsOpenShiftDto {
  @ApiProperty({ example: 'operator1', description: 'Operator user ID opening the shift' })
  @IsNotEmpty()
  @IsString()
  UserId: string;
}

export class FmsCloseShiftDto {
  // Empty payload object per API specification
}

export class FmsInfoShiftDto {
  // Empty payload object per API specification
}
