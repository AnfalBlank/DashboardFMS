import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;
    let customPayload: Record<string, any> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, any>;
        message = obj.message || message;
        errors = obj.errors;
        customPayload = obj;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[UnhandledException] ${exception.message}`, exception.stack);
      message =
        process.env.NODE_ENV === 'development'
          ? exception.message
          : 'Internal server error';
    }

    if (customPayload && typeof customPayload === 'object') {
      return response.status(status).json({
        success: false,
        ...customPayload,
      });
    }

    return response.status(status).json({
      success: false,
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' &&
        exception instanceof Error && { error: exception.message }),
    });
  }
}
