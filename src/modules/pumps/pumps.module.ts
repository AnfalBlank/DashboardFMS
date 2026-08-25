import { Module } from "@nestjs/common";
import { PumpsController, NozzlesController } from "./pumps.controller";
import { PumpsService } from "./pumps.service";
import { PumpSyncService } from "./pump-sync.service";

@Module({
  controllers: [PumpsController, NozzlesController],
  providers: [PumpsService, PumpSyncService],
  exports: [PumpsService],
})
export class PumpsModule { }
