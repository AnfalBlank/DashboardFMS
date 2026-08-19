import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository, EntityTarget, ObjectLiteral } from "typeorm";
import { ENABLER_DB_CONNECTION } from "./enabler.constants";
import {
  EnablerFuelingData,
  EnablerLastFuelingData,
  EnablerLastStatusPump,
  EnablerLastTankData,
  EnablerTotalizer,
  EnablerShiftHistory,
  EnablerStockTankShift,
  EnablerTankDelivery,
  EnablerSettingPump,
  EnablerSettingTank,
} from "./entities";

@Injectable()
export class EnablerDatabaseService {
  private readonly logger = new Logger(EnablerDatabaseService.name);

  constructor(
    @InjectDataSource(ENABLER_DB_CONNECTION)
    private readonly enablerDataSource: DataSource,
  ) {}

  /**
   * Get raw secondary DataSource instance
   */
  getDataSource(): DataSource {
    return this.enablerDataSource;
  }

  /**
   * Generic repository getter for Enabler entities
   */
  getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> {
    return this.enablerDataSource.getRepository(entity);
  }

  /**
   * Check connection status to Enabler DB
   */
  async checkConnection(): Promise<{
    name: string;
    connected: boolean;
    message: string;
    timestamp: Date;
  }> {
    try {
      if (!this.enablerDataSource.isInitialized) {
        return {
          name: ENABLER_DB_CONNECTION,
          connected: false,
          message: "Enabler database connection is not initialized",
          timestamp: new Date(),
        };
      }

      await this.enablerDataSource.query("SELECT 1");
      return {
        name: ENABLER_DB_CONNECTION,
        connected: true,
        message: "Enabler database connected successfully",
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(
        `Enabler database health check failed: ${error?.message || error}`,
      );
      return {
        name: ENABLER_DB_CONNECTION,
        connected: false,
        message: error?.message || "Connection failed",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get table row statistics
   */
  async getDatabaseStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};

    try {
      const [
        fuelingCount,
        lastFuelingCount,
        pumpStatusCount,
        tankDataCount,
        totalizerCount,
        shiftCount,
        tankDeliveryCount,
      ] = await Promise.all([
        this.getRepository(EnablerFuelingData)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerLastFuelingData)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerLastStatusPump)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerLastTankData)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerTotalizer)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerShiftHistory)
          .count()
          .catch(() => 0),
        this.getRepository(EnablerTankDelivery)
          .count()
          .catch(() => 0),
      ]);

      stats.fuelingData = fuelingCount;
      stats.lastFuelingData = lastFuelingCount;
      stats.lastStatusPump = pumpStatusCount;
      stats.lastTankData = tankDataCount;
      stats.totalizer = totalizerCount;
      stats.shiftHistory = shiftCount;
      stats.tankDelivery = tankDeliveryCount;
    } catch (error: any) {
      this.logger.error(
        `Failed to retrieve database stats: ${error?.message || error}`,
      );
    }

    return stats;
  }

  /**
   * Query recent fueling records from Enabler
   */
  async getRecentFuelingData(limit = 100): Promise<EnablerFuelingData[]> {
    return this.getRepository(EnablerFuelingData).find({
      order: { waktu_kirim: "DESC" },
      take: limit,
    });
  }

  /**
   * Query latest pump status
   */
  async getLatestPumpStatus(): Promise<EnablerLastStatusPump[]> {
    return this.getRepository(EnablerLastStatusPump).find({
      order: { index_pump: "ASC" },
    });
  }

  /**
   * Query latest tank ATG readings
   */
  async getLatestTankData(): Promise<EnablerLastTankData[]> {
    return this.getRepository(EnablerLastTankData).find({
      order: { id_tank: "ASC" },
    });
  }

  /**
   * Query current totalizers
   */
  async getTotalizers(): Promise<EnablerTotalizer[]> {
    return this.getRepository(EnablerTotalizer).find({
      order: { index_pump: "ASC", id_nozzle: "ASC" },
    });
  }

  /**
   * Query shift history
   */
  async getRecentShifts(limit = 20): Promise<EnablerShiftHistory[]> {
    return this.getRepository(EnablerShiftHistory).find({
      order: { open_shift_time: "DESC" },
      take: limit,
    });
  }
}
