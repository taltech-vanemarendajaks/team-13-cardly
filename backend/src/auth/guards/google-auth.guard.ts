import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const isCallback = req.path.endsWith('/callback');

    if (isCallback) {
      return {
        session: false,
        failureRedirect: this.buildFailureRedirect(req.query.state),
      };
    }

    return {
      session: false,
      scope: ['email', 'profile'],
      state: this.sanitizeReturnTo(req.query.returnTo),
    };
  }

  private buildFailureRedirect(state: unknown) {
    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000';
    const returnTo = this.sanitizeReturnTo(state);
    const url = new URL(returnTo, frontendUrl);
    url.searchParams.set('auth', 'error');
    return url.toString();
  }

  private sanitizeReturnTo(value: unknown) {
    if (typeof value !== 'string') {
      return '/login';
    }

    if (!value.startsWith('/') || value.startsWith('//')) {
      return '/login';
    }

    return value;
  }
}
