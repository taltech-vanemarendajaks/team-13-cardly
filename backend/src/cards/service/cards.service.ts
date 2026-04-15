import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CardsService {
  private readonly saltRounds: number;
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async create(userId: string, dto: CreateCardDto) {
    let hashedPassword: string | null = null;

    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);
    }

    return this.prisma.card.create({
      data: {
        ...dto,
        password: hashedPassword,
        userId,
      },
      omit: { password: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) throw new NotFoundException('Card not found');
    if (card.userId !== userId) throw new ForbiddenException();

    const { password, ...result } = card;
    return result;
  }

  async findPublic(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card || !card.isPublic) {
      throw new NotFoundException('Card not found');
    }

    if (card.scheduledAt && card.scheduledAt.getTime() > Date.now()) {
      throw new ForbiddenException('Card is not available yet');
    }

    if (card.password) {
      throw new ForbiddenException('Password required');
    }

    const { password, ...result } = card;
    return result;
  }

  async verifyPassword(id: string, password: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card || !card.isPublic) {
      throw new NotFoundException('Card not found');
    }

    if (card.scheduledAt && card.scheduledAt.getTime() > Date.now()) {
      throw new ForbiddenException('Card is not available yet');
    }

    if (!card.password) {
      return { ok: true };
    }

    const isValid = await bcrypt.compare(password ?? '', card.password);
    if (!isValid) {
      throw new ForbiddenException('Invalid password');
    }

    return { ok: true };
  }

  async update(userId: string, id: string, dto: UpdateCardDto) {
    await this.findOne(userId, id);

    const data = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, this.saltRounds);
    }

    return this.prisma.card.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.card.delete({
      where: { id },
    });
  }

  async getShareLink(userId: string, id: string) {
    await this.findOne(userId, id);
    const url = `${this.frontendUrl}/cards/${id}`;
    return { url };
  }

  async getQr(userId: string, id: string) {
    const { url } = await this.getShareLink(userId, id);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    return { url, qrImageUrl };
  }

  async getEmbed(userId: string, id: string) {
    const { url } = await this.getShareLink(userId, id);
    const code = `<iframe src="${url}" width="640" height="420" style="border:0;" loading="lazy" title="Cardly card"></iframe>`;
    return { url, code };
  }
}
