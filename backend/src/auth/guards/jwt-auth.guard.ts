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
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<express.Request>();
    const token = this.extractBearerToken(req);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const payload = await this.auth.verifyAccessToken(token);
    (req as express.Request & { userId: string }).userId = payload.sub;
    (req as express.Request & { userEmail: string }).userEmail = payload.email;

    return true;
  }

  private extractBearerToken(req: express.Request) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }

    return header.slice('Bearer '.length).trim();
  }
}
