import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ControllerPushService } from './controller-push.service';
import { ControllerTransactionPushDto } from './dto/controller-push.dto';
import { ControllerAuthGuard } from '../../common/guards/controller-auth.guard';

@ApiTags('Controller Push')
@Controller('api/controller')
export class ControllerPushController {
  constructor(private readonly controllerPushService: ControllerPushService) {}

  @Post('transaction')
  @UseGuards(ControllerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Controller push fuel dispensing transaction' })
  @ApiHeader({
    name: 'x-controller-secret',
    description: 'Controller shared secret key',
    required: true,
  })
  async handlePush(@Body() body: ControllerTransactionPushDto) {
    const data = await this.controllerPushService.handlePush(body);
    return { success: true, data };
  }
}
