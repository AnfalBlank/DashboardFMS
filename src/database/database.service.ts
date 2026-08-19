import { Injectable, Logger } from "@nestjs/common";
import { DataSource, QueryRunner, EntityManager } from "typeorm";

@Injectable()
export class DatabaseService {
  private readonly dbName = process.env.DATABASE_NAME || "FUEL_MONITORING_DB";
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

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
      if (!this.dataSource.isInitialized) {
        return {
          name: this.dbName,
          connected: false,
          message: "Database connection is not initialized",
          timestamp: new Date(),
        };
      }

      await this.dataSource.query("SELECT 1");
      return {
        name: this.dbName,
        connected: true,
        message: "Database connected successfully",
        timestamp: new Date(),
      };
    } catch (error: any) {
      this.logger.error(
        `Database health check failed: ${error?.message || error}`,
      );
      return {
        name: this.dbName,
        connected: false,
        message: error?.message || "Connection failed",
        timestamp: new Date(),
      };
    }
  }

  get ds(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.dataSource.manager;
  }

  createQueryRunner(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }

  async transaction<T>(
    runInTransaction: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(runInTransaction);
  }

  async query<T = any>(query: string, parameters?: any[]): Promise<T> {
    return this.dataSource.query(query, parameters);
  }
}
