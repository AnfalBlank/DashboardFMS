import { Module, DynamicModule, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FmsClientService } from './client/fms-client.service';
import { FMS_CONFIG_OPTIONS, FmsClientOptions } from './client/fms-client.config';
import {
  FmsAuthService,
  FmsDiscoveryService,
  FmsPumpService,
  FmsShiftService,
  FmsTankService,
  FmsRfidService,
  FmsConfigService,
  FmsSettingService,
  FmsUserService,
  FmsReportService,
  FmsUploadService,
} from './services';
import { FmsService } from './fms.service';
import { FmsController } from './fms.controller';

const SERVICES = [
  FmsClientService,
  FmsAuthService,
  FmsDiscoveryService,
  FmsPumpService,
  FmsShiftService,
  FmsTankService,
  FmsRfidService,
  FmsConfigService,
  FmsSettingService,
  FmsUserService,
  FmsReportService,
  FmsUploadService,
  FmsService,
];

@Global()
@Module({
  imports: [HttpModule],
  controllers: [FmsController],
  providers: [...SERVICES],
  exports: [HttpModule, ...SERVICES],
})
export class FmsModule {
  /**
   * Register FMS Module with custom client options (e.g. custom baseUrl, timeout)
   */
  static forRoot(options?: FmsClientOptions): DynamicModule {
    return {
      module: FmsModule,
      global: true,
      imports: [HttpModule],
      controllers: [FmsController],
      providers: [
        {
          provide: FMS_CONFIG_OPTIONS,
          useValue: options,
        },
        ...SERVICES,
      ],
      exports: [HttpModule, ...SERVICES],
    };
  }
}
