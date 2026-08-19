import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TanksService } from "./tanks.service";
import { FmsService } from "../fms";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class TankAtgSyncService implements OnModuleInit {
  private readonly logger = new Logger(TankAtgSyncService.name);

  constructor(
    private readonly tanksService: TanksService,
    private readonly fms: FmsService,
  ) {}

  async onModuleInit() {}

  @Cron("0 */2 * * * *") // Every 2 minutes
  async syncAllTanksTelemetry() {
    try {
      this.logger.debug(
        "syncAllTanksTelemetry: Starting tank telemetry sync...",
      );
      const { Tanks } = await this.fms.tanks.listTanks();
      if (Tanks?.length) {
        for (const tank of Tanks) {
          let hasChange = false;
          const iTank = await this.tanksService.findOne(tank.TankName);
          const volume: number = Number(tank.TankVolume);
          if (volume !== iTank.capacity_l) {
            iTank.capacity_l = volume;
            hasChange = true;
          }
          if (hasChange) {
            await this.tanksService.update(iTank.id, iTank, "usr-super01");
            this.logger.log(`Updated tank ${tank.TankName}`);
          }
        }
      }
    } catch {
    } finally {
      this.logger.debug("syncAllTanksTelemetry: Finished tank telemetry sync.");
    }
  }
}
