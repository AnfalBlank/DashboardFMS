import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import {
  Role,
  User,
  Permission,
  RolePermission,
  Unit,
  Product,
  PriceHistory,
  Vehicle,
  Card,
  QuotaPeriod,
  CardQuota,
  QuotaLedger,
  Pump,
  Nozzle,
  Totalizer,
  Tank,
  TankReading,
  StockMovement,
  Delivery,
  Transaction,
  Reconciliation,
  Approval,
  AuditLog,
  Notification,
  SystemSetting,
} from './entities';

const entities = [
  Role,
  User,
  Permission,
  RolePermission,
  Unit,
  Product,
  PriceHistory,
  Vehicle,
  Card,
  QuotaPeriod,
  CardQuota,
  QuotaLedger,
  Pump,
  Nozzle,
  Totalizer,
  Tank,
  TankReading,
  StockMovement,
  Delivery,
  Transaction,
  Reconciliation,
  Approval,
  AuditLog,
  Notification,
  SystemSetting,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 3306)),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'fuel_monitoring'),
        entities,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
        charset: 'utf8mb4_unicode_ci',
        timezone: '+07:00',
        extra: {
          connectionLimit: 20,
        },
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
