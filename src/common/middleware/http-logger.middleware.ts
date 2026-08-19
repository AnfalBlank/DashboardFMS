import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Resolve or generate Correlation ID
    const rawHeaderId =
      req.headers['x-correlation-id'] || req.headers['x-request-id'];
    const correlationId =
      typeof rawHeaderId === 'string' && rawHeaderId.trim().length > 0
        ? rawHeaderId
        : uuidv4();

    // Attach to request & response headers
    req.correlationId = correlationId;
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const startTime = process.hrtime.bigint();

    // 2. Log request completion upon response finish
    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = (Number(endTime - startTime) / 1e6).toFixed(2);

      const { method, originalUrl, ip } = req;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || '0';
      const userAgent = req.get('user-agent') || '-';

      const logMessage = `[${correlationId}] ${method} ${originalUrl} ${statusCode} +${durationMs}ms - ${contentLength}b - ${ip} "${userAgent}"`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    // 3. Handle prematurely closed connection (client abort)
    res.on('close', () => {
      if (!res.writableEnded) {
        const endTime = process.hrtime.bigint();
        const durationMs = (Number(endTime - startTime) / 1e6).toFixed(2);
        const { method, originalUrl, ip } = req;

        this.logger.warn(
          `[${correlationId}] ${method} ${originalUrl} [ABORTED] +${durationMs}ms - ${ip}`,
        );
      }
    });

    next();
  }
}
