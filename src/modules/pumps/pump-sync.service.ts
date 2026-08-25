import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { ENABLER_DB_CONNECTION, EnablerLastStatusPump } from "src/database/enabler";
import { In, Repository } from "typeorm";
import { PumpsService } from "./pumps.service";

@Injectable()
export class PumpSyncService implements OnModuleInit {
  private readonly logger = new Logger(PumpSyncService.name);

  constructor(
    @InjectRepository(EnablerLastStatusPump, ENABLER_DB_CONNECTION)
    private readonly statusPumpRepo: Repository<EnablerLastStatusPump>,

    private readonly pumpsService: PumpsService,
  ) { }

  onModuleInit() {
  }

  private pumpStatusMapping(status: EnablerLastStatusPump) {
    if (status.pump_connected == 0) {
      return 'OFFLINE';
    }

    if (status.pump_idle == 1) {
      return 'IDLE';
    }
    if (status.pump_nozzleup == 1) {
      return 'NOZZLE_UP';
    }
    if (status.pump_fueling == 1) {
      return 'FUELLING';
    }

    return 'OFFLINE';
  }

  @Cron("*/2 * * * * *") // Every 2 seconds
  async syncAllPumpsStatus() {
    try {
      // this.logger.debug("syncAllPumpsStatus: Starting pump status sync...");
      const pumps = await this.pumpsService.getPumps();
      const validEnablerIds = pumps
        .map((p) => p.id_pump_enabler - 1)
        .filter((id): id is number => id !== null && id !== undefined);

      if (validEnablerIds.length === 0) {
        return;
      }

      const statusPumps = await this.statusPumpRepo.find({
        where: {
          index_pump: In(validEnablerIds.map((id) => id)),
        },
      });

      for (const status of statusPumps) {
        const pump = pumps.find((p) => p.id_pump_enabler - 1 === status.index_pump);
        if (!pump) {
          continue;
        }
        const newStatus = this.pumpStatusMapping(status);
        if (pump.status !== newStatus) {
          this.logger.log(
            `Pump ${pump.number} (ID: ${pump.id}) status changed: ${pump.status} -> ${newStatus}`,
          );
          await this.pumpsService.updatePump(pump.id, { status: newStatus });
        }
      }
    } catch (error) {
      // this.logger.error("Error in syncAllPumpsStatus:", error);
    } finally {
      // this.logger.debug("syncAllPumpsStatus: Finished pump status sync.");
    }
  }
}
