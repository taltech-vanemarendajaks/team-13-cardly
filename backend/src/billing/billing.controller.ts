import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BillingService } from './billing.service.js';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(
    @Req() req: express.Request & { userId: string },
    @Body('plan') plan: 'pro' | 'business',
  ) {
    return this.billing.createCheckoutSession(req.userId, plan);
  }

  @UseGuards(JwtAuthGuard)
  @Get('portal')
  async portal(@Req() req: express.Request & { userId: string }) {
    return this.billing.createPortalSession(req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancel(@Req() req: express.Request & { userId: string }) {
    return this.billing.cancelSubscription(req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async subscription(@Req() req: express.Request & { userId: string }) {
    return this.billing.getSubscription(req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-checkout')
  async verifyCheckout(@Req() req: express.Request & { userId: string }) {
    return this.billing.verifyCheckout(req.userId);
  }

  @Post('webhook')
  async webhook(
    @Req() req: express.Request & { rawBody?: Buffer },
    @Res() res: express.Response,
  ) {
    const sig = req.headers['stripe-signature'] as string;
    console.log('[Webhook] Received request, sig:', !!sig, 'rawBody:', !!req.rawBody, 'bodyLength:', req.rawBody?.length ?? 0);

    if (!sig || !req.rawBody) {
      console.log('[Webhook] Missing sig or rawBody');
      return res.status(400).json({ error: 'Missing signature or body' });
    }

    try {
      const event = this.billing.constructEvent(req.rawBody, sig);
      console.log('[Webhook] Event type:', event.type);
      await this.billing.handleWebhookEvent(event);
      console.log('[Webhook] Handled successfully');
      return res.status(200).json({ received: true });
    } catch (err: any) {
      console.log('[Webhook] Error:', err?.message ?? err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }
  }
}
