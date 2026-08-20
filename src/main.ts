import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

process.on("unhandledRejection", (reason) =>
  console.error("[UnhandledRejection]", reason),
);
process.on("uncaughtException", (err) =>
  console.error("[UncaughtException]", err.message),
);

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const PORT = Number(process.env.PORT ?? 4000);

  // ── Security middleware ──
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000", "http://localhost:4001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // app.use(
  //   "/api/",
  //   rateLimit({
  //     windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
  //     max: Number(process.env.RATE_LIMIT_MAX ?? 500),
  //     message: {
  //       success: false,
  //       message: "Terlalu banyak request, coba lagi nanti.",
  //     },
  //   }),
  // );

  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true }));

  // ── Global Filter & Pipe ──
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  // ── Swagger OpenAPI Documentation ──
  const config = new DocumentBuilder()
    .setTitle("Fuel Monitoring & Management API")
    .setDescription(
      "SPBP Polda Papua Barat — Fuel Monitoring System Backend API Documentation",
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(PORT);

  logger.log(
    `   🚀 Fuel Monitoring API (NestJS) — port ${PORT} — ${process.env.NODE_ENV}`,
  );
  // logger.log(`   DB: ${process.env.TURSO_URL}`);
  logger.log(`   Swagger Docs: http://localhost:${PORT}/api/docs\n`);
  // logger.log("   GET  /health");
  // logger.log('   POST /api/auth/login');
  // logger.log('   GET  /api/dashboard');
  // logger.log('   GET  /api/transactions   POST /api/transactions');
  // logger.log('   GET  /api/cards');
  // logger.log('   GET  /api/quotaPOST /api/quota/generate   POST /api/quota/topup');
  // logger.log('   GET  /api/tanks          POST /api/tanks/:id/readings');
  // logger.log('   GET  /api/stock          POST /api/stock/deliveries  POST /api/stock/adjustment');
  // logger.log('   GET  /api/pumps          GET  /api/pumps/nozzles     GET /api/pumps/totalizers');
  // logger.log('   GET  /api/reconciliation POST /api/reconciliation/run');
  // logger.log('   GET  /api/reports/executive  /reports/transactions  /reports/quota  /reports/stock');
  // logger.log('   GET  /api/master/products  /master/prices  /master/vehicles  /master/units');
  // logger.log('   GET  /api/system/audit   /system/approvals  /system/settings');
  // logger.log('   POST /api/controller/transaction  ← fuel pump controller push\n');
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
