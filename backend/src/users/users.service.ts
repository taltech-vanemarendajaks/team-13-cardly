import { ConflictException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleUserProfile {
  email: string;
  name?: string;
  googleId: string;
  avatarUrl?: string;
}

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  googleId: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  refreshTokenHash: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
      select: publicUserSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        googleId: true,
      },
    });
  }

  async findByIdForRefresh(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: authUserSelect,
    });
  }

  async createGoogleUser(profile: GoogleUserProfile) {
    return this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      },
      select: publicUserSelect,
    });
  }

  async updateGoogleProfile(userId: string, profile: GoogleUserProfile) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      },
      select: publicUserSelect,
    });
  }

  async findOrCreateGoogleUser(profile: GoogleUserProfile) {
    const existingGoogleUser = await this.findByGoogleId(profile.googleId);

    if (existingGoogleUser) {
      return this.updateGoogleProfile(existingGoogleUser.id, profile);
    }

    const existingEmailUser = await this.findByEmail(profile.email);

    if (existingEmailUser && existingEmailUser.googleId !== profile.googleId) {
      throw new ConflictException(
        'Email is already linked to another Google account',
      );
    }

    if (existingEmailUser) {
      return this.updateGoogleProfile(existingEmailUser.id, profile);
    }

    return this.createGoogleUser(profile);
  }

  async saveRefreshTokenHash(userId: string, refreshTokenHash: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async clearRefreshTokenHash(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
