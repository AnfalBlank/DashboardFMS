import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { EnablerDatabaseService } from "src/database/enabler";
import { DatabaseService } from "src/database/database.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly enablerDatabaseService: EnablerDatabaseService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  async check() {
    const dbStatus = await Promise.all([
      this.enablerDatabaseService.checkConnection(),
      this.databaseService.checkConnection(),
    ]);

    if (dbStatus.some((status) => !status.connected)) {
      return {
        status: "error",
        service: "Fuel Monitoring API",
        dbStatus,
        ts: new Date().toISOString(),
      };
    }

    return {
      status: "ok",
      service: "Fuel Monitoring API",
      dbStatus,
      ts: new Date().toISOString(),
    };
  }
}
