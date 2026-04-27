import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe') as any;
import { PrismaService } from '../prisma/prisma.service.js';
import { PLAN_LIMITS, type PlanName } from './plan-limits.js';

@Injectable()
export class BillingService {
  private stripe: InstanceType<typeof Stripe>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY must be configured');
    }
    this.stripe = new Stripe(secretKey);
  }

  private get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  private get webhookSecret(): string {
    return this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
  }

  private getPriceId(plan: 'pro' | 'business'): string {
    const key = plan === 'pro' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_BUSINESS_PRICE_ID';
    const priceId = this.config.get<string>(key);
    if (!priceId) throw new BadRequestException(`Price not configured for ${plan}`);
    return priceId;
  }

  private priceToPlan(priceId: string): PlanName {
    if (priceId === this.config.get<string>('STRIPE_PRO_PRICE_ID')) return 'pro';
    if (priceId === this.config.get<string>('STRIPE_BUSINESS_PRICE_ID')) return 'business';
    return 'free';
  }

  // ── Get or create Stripe customer ────────────────────────────

  private async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  // ── Checkout ─────────────────────────────────────────────────

  async createCheckoutSession(userId: string, plan: 'pro' | 'business') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // If user already has an active subscription, do in-place change
    if (user.stripeSubscriptionId && user.stripeStatus === 'active') {
      const currentPlan = user.plan as PlanName;
      if (currentPlan === plan) {
        throw new BadRequestException('Already on this plan');
      }
      await this.changeSubscription(userId, plan);
      return { changed: true };
    }

    const customerId = await this.getOrCreateCustomer(userId);
    const priceId = this.getPriceId(plan);
    const isFirstSubscription = !user.hadTrial;

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      ...(isFirstSubscription && {
        subscription_data: { trial_period_days: 7 },
      }),
      success_url: `${this.frontendUrl}/cards?checkout=success`,
      cancel_url: `${this.frontendUrl}/cards`,
      metadata: { userId, plan },
    });

    // Mark trial as used
    if (isFirstSubscription) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hadTrial: true },
      });
    }

    return { url: session.url };
  }

  // ── In-place upgrade/downgrade ───────────────────────────────

  async changeSubscription(userId: string, newPlan: 'pro' | 'business') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription to change');
    }

    const sub = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const itemId = sub.items.data[0]?.id;
    if (!itemId) throw new BadRequestException('Subscription has no items');

    const newPriceId = this.getPriceId(newPlan);

    await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'create_prorations',
    });
  }

  // ── Portal ───────────────────────────────────────────────────

  async createPortalSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
      throw new BadRequestException('No billing account');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.frontendUrl}/cards`,
    });

    return { url: session.url };
  }

  // ── Cancel ───────────────────────────────────────────────────

  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription');
    }

    if (user.stripeStatus === 'trialing') {
      // Trial: cancel immediately, no charge
      await this.stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } else {
      // Active: cancel at end of billing period
      await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return { ok: true };
  }

  // ── Verify checkout (fallback for when webhooks don't fire) ──

  async verifyCheckout(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) return { plan: user?.plan ?? 'free' };

    // Already updated by webhook
    if (user.plan !== 'free' && user.stripeSubscriptionId) {
      return { plan: user.plan };
    }

    // Check Stripe for active subscriptions
    const subs = await this.stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    const sub = subs.data[0];
    if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
      const priceId = sub.items.data[0]?.price?.id;
      const plan = priceId ? this.priceToPlan(priceId) : 'free';

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          stripeSubscriptionId: sub.id,
          stripeStatus: sub.status,
          plan,
        },
      });

      return { plan, updated: true };
    }

    return { plan: user.plan ?? 'free' };
  }

  // ── Get subscription info ────────────────────────────────────

  async getSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const plan = (user.plan ?? 'free') as PlanName;
    const limits = PLAN_LIMITS[plan];

    let currentPeriodEnd: string | null = null;
    if (user.stripeSubscriptionId) {
      try {
        const sub = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      } catch {
        // subscription may have been deleted
      }
    }

    return {
      plan,
      stripeStatus: user.stripeStatus,
      limits,
      currentPeriodEnd,
    };
  }

  // ── Webhook ──────────────────────────────────────────────────

  constructEvent(rawBody: Buffer, signature: string): any {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = priceId ? this.priceToPlan(priceId) : 'free';

        await this.prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status,
            plan,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        await this.prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: 'free',
            stripeSubscriptionId: null,
            stripeStatus: null,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          await this.prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { stripeStatus: 'past_due' },
          });
        }
        break;
      }
    }
  }
}
