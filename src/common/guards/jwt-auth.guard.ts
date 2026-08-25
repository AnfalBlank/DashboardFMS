import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const queryToken = request.query?.token as string | undefined;

    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (queryToken) {
      token = queryToken;
    }

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token tidak ditemukan',
      });
    }
    const secret = process.env.JWT_SECRET;

    try {
      const payload = jwt.verify(token, secret) as AuthUser;
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({
        success: false,
        message: 'Token tidak valid atau sudah expired',
      });
    }
  }
}
