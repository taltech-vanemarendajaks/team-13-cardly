import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // POST /auth/google/token
  @Post('google/token')
  async googleToken(
    @Body('accessToken') accessToken: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.auth.googleToken(accessToken);
    this.setTokenCookie(res, result.token);
    return { user: result.user, isNewUser: result.isNewUser };
  }

  // POST /auth/register
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.auth.register(email, password);
    this.setTokenCookie(res, result.token);
    return { user: result.user };
  }

  // POST /auth/login
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.auth.login(email, password);
    this.setTokenCookie(res, result.token);
    return { user: result.user };
  }

  // GET /auth/me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: express.Request) {
    const userId = (req as express.Request & { userId: string }).userId;
    return this.auth.me(userId);
  }

  // POST /auth/logout
  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return { ok: true };
  }

  // ── Helpers ──

  private setTokenCookie(res: express.Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }
}
