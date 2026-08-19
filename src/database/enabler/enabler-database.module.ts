import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENABLER_DB_CONNECTION } from './enabler.constants';
import { enablerEntities } from './enabler-entities';
import { EnablerDatabaseService } from './enabler-database.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: ENABLER_DB_CONNECTION,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        name: ENABLER_DB_CONNECTION,
        host: config.get<string>('ENABLER_DB_HOST', config.get<string>('DB_HOST', 'localhost')),
        port: Number(config.get<number>('ENABLER_DB_PORT', 3306)),
        username: config.get<string>('ENABLER_DB_USER', config.get<string>('DB_USER', 'root')),
        password: config.get<string>('ENABLER_DB_PASS', config.get<string>('DB_PASS', '')),
        database: config.get<string>('ENABLER_DB_NAME', 'enablerujb'),
        entities: enablerEntities,
        synchronize: config.get<string>('ENABLER_DB_SYNCHRONIZE', 'false') === 'true',
        logging: config.get<string>('ENABLER_DB_LOGGING', 'false') === 'true',
        charset: 'utf8mb4_unicode_ci',
        timezone: '+07:00',
        extra: {
          connectionLimit: 10,
        },
      }),
    }),
    TypeOrmModule.forFeature(enablerEntities, ENABLER_DB_CONNECTION),
  ],
  providers: [EnablerDatabaseService],
  exports: [TypeOrmModule, EnablerDatabaseService],
})
export class EnablerDatabaseModule {}
