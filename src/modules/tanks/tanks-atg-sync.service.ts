import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TanksService } from "./tanks.service";
import { FmsService } from "../fms";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { ENABLER_DB_CONNECTION, EnablerLastTankData, EnablerSettingTank } from "src/database/enabler";
import { Repository } from "typeorm";

@Injectable()
export class TankAtgSyncService implements OnModuleInit {
  private readonly logger = new Logger(TankAtgSyncService.name);

  constructor(
    private readonly tanksService: TanksService,
    @InjectRepository(EnablerSettingTank, ENABLER_DB_CONNECTION)
    private readonly settingTankRepo: Repository<EnablerSettingTank>,

    @InjectRepository(EnablerLastTankData, ENABLER_DB_CONNECTION)
    private readonly lastTankDataRepo: Repository<EnablerLastTankData>,
  ) { }

  async onModuleInit() { }

  @Cron("*/2 * * * * *") // Every 2 seconds
  async syncAllTanksTelemetry() {
    try {
      // this.logger.debug(
      //   "syncAllTanksTelemetry: Starting tank telemetry sync...",
      // );
      const monTanks = await this.tanksService.findAll();
      monTanks.forEach(async (tank) => {
        const [settingTank, lastTankData] = await Promise.all([this.settingTankRepo.findOneBy({ id_tank: tank.id_tank_enabler }),
        this.lastTankDataRepo.findOneBy({ id_tank: tank.id_tank_enabler })
        ]);

        settingTank.id_polling = tank.id_polling;
        settingTank.id_port = tank.id_port;
        settingTank.aktif_flag = tank.active;
        settingTank.warna_air = tank.water_color;
        settingTank.warna_oil = tank.oil_color;
        await this.settingTankRepo.save(settingTank);
      });

    } catch (error) {
      this.logger.debug(error);
    } finally {
      // this.logger.debug("syncAllTanksTelemetry: Finished tank telemetry sync.");
    }
  }


  @Cron("0 */5 * * * *") // Every 5 minutes
  async syncAddReadingSensor() {
    try {
      // this.logger.debug(
      //   "syncAddReadingSensor: Starting tank telemetry sync...",
      // );
      const monTanks = await this.tanksService.findAll();
      monTanks.forEach(async (tank) => {
        const [lastTankData] = await Promise.all([
          this.lastTankDataRepo.findOneBy({ id_tank: tank.id_tank_enabler })
        ]);
        await this.tanksService.addReading(tank.id, {
          volume_l: Number(lastTankData.volume_oil),
          water_level: Number(lastTankData.tinggi_air),
          read_at: new Date().toISOString(),
          height_cm: Number(lastTankData.tinggi_oil),
          source: "SENSOR",
          temperature: Number(lastTankData.temperature),
        })
      });


    } catch (error) {
      // this.logger.debug(error);
    } finally {
      // this.logger.debug("syncAddReadingSensor: Finished tank telemetry sync.");
    }
  }
}
