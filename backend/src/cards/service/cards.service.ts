import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCardDto) {
    let hashedPassword: string | null = null;

    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.card.create({
      data: {
        ...dto,
        password: hashedPassword,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) throw new NotFoundException('Card not found');
    if (card.userId !== userId) throw new ForbiddenException();

    return card;
  }

  async update(userId: string, id: string, dto: UpdateCardDto) {
    await this.findOne(userId, id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.card.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.card.delete({
      where: { id },
    });
  }
}