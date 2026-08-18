import { Module } from '@nestjs/common';
import { PumpsController, NozzlesController } from './pumps.controller';
import { PumpsService } from './pumps.service';

@Module({
  controllers: [PumpsController, NozzlesController],
  providers: [PumpsService],
  exports: [PumpsService],
})
export class PumpsModule {}
