import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service.js';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // ── Google OAuth ──────────────────────────────────────────────

  async googleToken(accessToken: string) {
    // Verify access token with Google's userinfo endpoint
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
    );
    if (!res.ok) throw new UnauthorizedException('Invalid Google token');

    const info = (await res.json()) as GoogleUserInfo;
    if (!info.email) throw new UnauthorizedException('No email from Google');

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: info.sub }, { email: info.email }],
      },
    });

    let isNewUser = false;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: info.email,
          name: info.name ?? null,
          googleId: info.sub,
          avatarUrl: info.picture ?? null,
        },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      // Link Google to existing email/password account
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: info.sub, avatarUrl: user.avatarUrl ?? info.picture },
      });
    }

    const token = this.signToken(user.id, user.email);
    return { token, user: this.sanitizeUser(user), isNewUser };
  }

  // ── Email / Password ─────────────────────────────────────────

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });

    const token = this.signToken(user.id, user.email);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.id, user.email);
    return { token, user: this.sanitizeUser(user) };
  }

  // ── Session ───────────────────────────────────────────────────

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  // ── JWT helpers ───────────────────────────────────────────────

  signToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.sign(payload, { expiresIn: '30d' });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    googleId?: string | null;
    passwordHash?: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      hasGoogle: !!user.googleId,
      hasPassword: !!user.passwordHash,
    };
  }
}
