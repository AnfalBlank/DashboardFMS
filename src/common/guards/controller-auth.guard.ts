import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ControllerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = request.headers['x-controller-secret'];
    const expectedSecret =
      process.env.CONTROLLER_SECRET || 'spbp-controller-2026';

    if (secret !== expectedSecret) {
      throw new UnauthorizedException({
        success: false,
        message: 'Unauthorized controller',
      });
    }

    return true;
  }
}
