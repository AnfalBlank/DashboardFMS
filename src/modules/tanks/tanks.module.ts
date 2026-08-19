import { Module } from '@nestjs/common';
import { TanksController } from './tanks.controller';
import { TanksService } from './tanks.service';
import { TankAtgSyncService } from './tanks-atg-sync.service';

@Module({
  controllers: [TanksController],
  providers: [TanksService, TankAtgSyncService],
  exports: [TanksService],
})
export class TanksModule { }
