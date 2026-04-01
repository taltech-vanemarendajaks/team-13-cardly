import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { Profile } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';
import { AuthUser } from './interfaces/auth-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateGoogleUser(profile: Profile) {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();

    if (!email) {
      throw new UnauthorizedException('Google account did not provide an email address');
    }

    return this.usersService.findOrCreateGoogleUser({
      email,
      name: profile.displayName,
      googleId: profile.id,
      avatarUrl: profile.photos?.[0]?.value,
    });
  }

  async login(user: AuthUser) {
    const tokens = await this.generateTokens(user);
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);

    await this.usersService.saveRefreshTokenHash(user.id, refreshTokenHash);

    return {
      ...tokens,
      user,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersService.findByIdForRefresh(payload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
    });
    const nextRefreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);

    await this.usersService.saveRefreshTokenHash(user.id, nextRefreshTokenHash);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshTokenHash(userId);

    return {
      message: 'Logged out successfully',
    };
  }

  private async generateTokens(user: Pick<AuthUser, 'id' | 'email'>) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessTokenExpiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRY') ??
      '15m') as StringValue;
    const refreshTokenExpiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRY') ??
      '7d') as StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshTokenSecret(),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  private async hashRefreshToken(refreshToken: string) {
    const configuredRounds = Number.parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? '10',
      10,
    );
    const saltRounds = Number.isNaN(configuredRounds) || configuredRounds < 10 ? 10 : configuredRounds;

    return bcrypt.hash(refreshToken, saltRounds);
  }

  private getAccessTokenSecret() {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET must be configured');
    }

    return secret;
  }

  private getRefreshTokenSecret() {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET must be configured');
    }

    return secret;
  }
}
