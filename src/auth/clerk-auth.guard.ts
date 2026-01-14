import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!req.auth?.isAuthenticated || !req.auth.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
