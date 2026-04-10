import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from '../auth.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<express.Request>();
    const token = req.cookies?.['token'] as string | undefined;

    if (!token) throw new UnauthorizedException();

    const payload = this.auth.verifyToken(token);
    (req as express.Request & { userId: string }).userId = payload.sub;
    (req as express.Request & { userEmail: string }).userEmail = payload.email;

    return true;
  }
}
