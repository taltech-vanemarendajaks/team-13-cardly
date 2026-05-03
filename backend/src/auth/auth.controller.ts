import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AuthService } from './auth.service.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  private readonly refreshCookieName = 'refreshToken';
  private readonly refreshCookiePath = '/api/auth';

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req()
    req: express.Request & {
      user?: {
        accessToken: string;
        accessTokenExpiresIn: string;
        refreshToken: string;
        user: unknown;
        isNewUser: boolean;
      };
      query: { state?: string };
    },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = req.user;
    if (!result) {
      throw new UnauthorizedException('Google sign-in failed');
    }

    this.setRefreshTokenCookie(res, result.refreshToken);
    return res.redirect(this.buildFrontendRedirectUrl(req.query.state));
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.auth.register(email, password);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn,
      user: result.user,
    };
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.auth.login(email, password);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      accessTokenExpiresIn: result.accessTokenExpiresIn,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.[this.refreshCookieName] as
      | string
      | undefined;

    if (!refreshToken) {
      this.clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Missing refresh token');
    }

    try {
      const result = await this.auth.refresh(refreshToken);
      this.setRefreshTokenCookie(res, result.refreshToken);

      return {
        accessToken: result.accessToken,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
      };
    } catch (error) {
      this.clearRefreshTokenCookie(res);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: express.Request & { userId: string }) {
    return this.auth.me(req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: express.Request & { userId: string }) {
    return this.auth.me(req.userId);
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.[this.refreshCookieName] as
      | string
      | undefined;
    const accessToken = this.extractBearerToken(req);

    await this.auth.logout({ accessToken, refreshToken });
    this.clearRefreshTokenCookie(res);

    return { ok: true };
  }

  private setRefreshTokenCookie(res: express.Response, refreshToken: string) {
    res.cookie(this.refreshCookieName, refreshToken, {
      ...this.getRefreshCookieOptions(),
      maxAge: this.getRefreshCookieMaxAge(),
    });
  }

  private clearRefreshTokenCookie(res: express.Response) {
    res.clearCookie(this.refreshCookieName, this.getRefreshCookieOptions());
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  private extractBearerToken(req: express.Request) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }

    return header.slice('Bearer '.length).trim();
  }

  private getRefreshCookieOptions(): express.CookieOptions {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: this.refreshCookiePath,
    };
  }

  private getRefreshCookieMaxAge() {
    const refreshTokenExpiry =
      this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d';

    return this.durationToMs(refreshTokenExpiry);
  }

  private durationToMs(value: string) {
    const match = value.trim().match(/^(\d+)(ms|s|m|h|d)$/i);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'ms':
        return amount;
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private buildFrontendRedirectUrl(returnTo?: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const url = new URL(this.sanitizeReturnTo(returnTo), frontendUrl);
    url.searchParams.set('auth', 'success');
    return url.toString();
  }

  private sanitizeReturnTo(value?: string) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
      return '/login';
    }

    return value;
  }
}
