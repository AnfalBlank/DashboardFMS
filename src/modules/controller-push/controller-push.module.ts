import { Module } from '@nestjs/common';
import { ControllerPushController } from './controller-push.controller';
import { ControllerPushService } from './controller-push.service';

@Module({
  controllers: [ControllerPushController],
  providers: [ControllerPushService],
  exports: [ControllerPushService],
})
export class ControllerPushModule {}
