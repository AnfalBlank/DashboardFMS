import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator to extract the Correlation ID from the incoming HTTP request.
 * Usage:
 *   @Get()
 *   example(@CorrelationId() correlationId: string) { ... }
 */
export const CorrelationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (
      request.correlationId ||
      (request.headers?.['x-correlation-id'] as string) ||
      ''
    );
  },
);
