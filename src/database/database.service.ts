import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

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
