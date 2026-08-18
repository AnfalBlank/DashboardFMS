import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CardsModule } from './modules/cards/cards.module';
import { QuotaModule } from './modules/quota/quota.module';
import { TanksModule } from './modules/tanks/tanks.module';
import { StockModule } from './modules/stock/stock.module';
import { PumpsModule } from './modules/pumps/pumps.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MasterModule } from './modules/master/master.module';
import { SystemModule } from './modules/system/system.module';
import { ControllerPushModule } from './modules/controller-push/controller-push.module';
import { HealthModule } from './modules/health/health.module';
import { FmsModule } from './modules/fms/fms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuditModule,
    AuthModule,
    DashboardModule,
    TransactionsModule,
    CardsModule,
    QuotaModule,
    TanksModule,
    StockModule,
    PumpsModule,
    ReconciliationModule,
    ReportsModule,
    MasterModule,
    SystemModule,
    ControllerPushModule,
    HealthModule,
    FmsModule,
  ],
})
export class AppModule {}
