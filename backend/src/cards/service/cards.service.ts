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

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
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
}
