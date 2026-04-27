import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

interface GoogleProfileInput {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

interface AuthTokens {
  accessToken: string;
  accessTokenExpiresIn: string;
  refreshToken: string;
}

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  googleId: string | null;
  passwordHash: string | null;
  refreshTokenHash: string | null;
  plan: string;
  stripeStatus: string | null;
}

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTokenSecret = this.config.getOrThrow<string>('JWT_SECRET');
    this.refreshTokenSecret =
      this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.accessTokenExpiry =
      this.config.get<string>('JWT_ACCESS_EXPIRY') ?? '15m';
    this.refreshTokenExpiry =
      this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d';
    this.bcryptSaltRounds = this.parseBcryptSaltRounds(
      this.config.get<string>('BCRYPT_SALT_ROUNDS'),
    );
  }

  async loginWithGoogleProfile(profile: GoogleProfileInput) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name ?? null,
          googleId: profile.googleId,
          avatarUrl: profile.picture ?? null,
        },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: user.avatarUrl ?? profile.picture ?? null,
          name: user.name ?? profile.name ?? null,
        },
      });
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...this.buildAuthResponse(tokens),
      user: this.sanitizeUser(user),
      isNewUser,
    };
  }

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptSaltRounds);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...this.buildAuthResponse(tokens),
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return {
      ...this.buildAuthResponse(tokens),
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return this.buildAuthResponse(tokens);
  }

  async logout(options: {
    accessToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    const { accessToken, refreshToken } = options;

    let userId: string | null = null;

    if (refreshToken) {
      try {
        const payload = await this.verifyRefreshToken(refreshToken);
        userId = payload.sub;
      } catch {
        userId = null;
      }
    }

    if (!userId && accessToken) {
      try {
        const payload = await this.verifyAccessToken(accessToken);
        userId = payload.sub;
      } catch {
        userId = null;
      }
    }

    if (userId) {
      await this.prisma.user.updateMany({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.sanitizeUser(user);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.accessTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiry as never,
      }),
      this.jwt.signAsync(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiry as never,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      this.bcryptSaltRounds,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      accessTokenExpiresIn: this.accessTokenExpiry,
      refreshToken,
    };
  }

  private buildAuthResponse(tokens: AuthTokens) {
    return {
      accessToken: tokens.accessToken,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  private parseBcryptSaltRounds(value?: string) {
    const parsed = Number.parseInt(value ?? '12', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
  }

  private sanitizeUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      hasGoogle: !!user.googleId,
      hasPassword: !!user.passwordHash,
      plan: user.plan,
      stripeStatus: user.stripeStatus,
    };
  }
}
