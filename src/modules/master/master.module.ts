import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';
import { MasterAtgSyncService } from './master-atg-sync.service';

@Module({
  controllers: [MasterController],
  providers: [MasterService, MasterAtgSyncService],
  exports: [MasterService],
})
export class MasterModule { }
