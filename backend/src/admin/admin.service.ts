import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalUsers, totalCards, planCounts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.card.count(),
      this.prisma.user.groupBy({
        by: ['plan'],
        _count: true,
      }),
    ]);

    const planBreakdown: Record<string, number> = {};
    for (const row of planCounts) {
      planBreakdown[row.plan] = row._count;
    }

    const paidUsers = (planBreakdown['pro'] ?? 0) + (planBreakdown['business'] ?? 0);
    const mrr = (planBreakdown['pro'] ?? 0) * 9 + (planBreakdown['business'] ?? 0) * 19;

    return {
      totalUsers,
      totalCards,
      paidUsers,
      freeUsers: planBreakdown['free'] ?? 0,
      mrr,
      planBreakdown,
    };
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        stripeStatus: true,
        createdAt: true,
        _count: { select: { cards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.plan,
      stripeStatus: u.stripeStatus,
      cardCount: u._count.cards,
      createdAt: u.createdAt,
    }));
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        cards: {
          select: {
            id: true,
            title: true,
            template: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeStatus: user.stripeStatus,
      hadTrial: user.hadTrial,
      createdAt: user.createdAt,
      cards: user.cards,
    };
  }

  async updateUser(id: string, data: { plan?: string; email?: string; stripeStatus?: string | null }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, plan: true, stripeStatus: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Cascade deletes cards → media via Prisma relations
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.prisma.card.delete({ where: { id: cardId } });
    return { deleted: true };
  }
}
