import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CardsService } from './service/cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get(':id/public')
  findPublic(@Param('id') id: string) {
    return this.cardsService.findPublic(id);
  }

  @Post(':id/verify-password')
  verifyPassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.cardsService.verifyPassword(id, password);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateCardDto) {
    return this.cardsService.create(req.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.cardsService.findAll(req.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/share-link')
  getShareLink(@Req() req, @Param('id') id: string) {
    return this.cardsService.getShareLink(req.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/qr')
  getQr(@Req() req, @Param('id') id: string) {
    return this.cardsService.getQr(req.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/embed')
  getEmbed(@Req() req, @Param('id') id: string) {
    return this.cardsService.getEmbed(req.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.cardsService.findOne(req.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  replace(@Req() req, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(req.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(req.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.cardsService.remove(req.userId, id);
  }
}
