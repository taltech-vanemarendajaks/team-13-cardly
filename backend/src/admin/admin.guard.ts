import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as express from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const adminKey = process.env['ADMIN_KEY'];
    if (!adminKey) throw new NotFoundException();

    const req = context.switchToHttp().getRequest<express.Request>();
    const headerKey = req.headers['x-admin-key'] as string | undefined;

    if (headerKey !== adminKey) throw new NotFoundException();

    return true;
  }
}
