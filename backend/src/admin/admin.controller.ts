import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('overview')
  async overview() {
    return this.admin.getOverview();
  }

  @Get('users')
  async users() {
    return this.admin.getUsers();
  }

  @Get('users/:id')
  async user(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { plan?: string; email?: string; stripeStatus?: string | null },
  ) {
    return this.admin.updateUser(id, body);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.admin.deleteUser(id);
  }

  @Delete('users/:id/cards/:cardId')
  async deleteCard(
    @Param('id') userId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.admin.deleteCard(userId, cardId);
  }
}
