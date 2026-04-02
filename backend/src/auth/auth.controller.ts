import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  cookies?: Record<string, string | undefined>;
  user: {
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const session = await this.authService.login(req.user);

    res.cookie(
      this.authService.getRefreshTokenCookieName(),
      session.refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );

    return res.redirect(this.authService.getFrontendRedirectUrl());
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenDto,
  ) {
    const refreshToken =
      req.cookies?.[this.authService.getRefreshTokenCookieName()] ?? body?.refreshToken;
    const session = await this.authService.refresh(refreshToken);

    res.cookie(
      this.authService.getRefreshTokenCookieName(),
      session.refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );

    return {
      accessToken: session.accessToken,
      accessTokenExpiresIn: session.accessTokenExpiresIn,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      this.authService.getRefreshTokenCookieName(),
      this.authService.getRefreshTokenCookieClearOptions(),
    );

    return this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
