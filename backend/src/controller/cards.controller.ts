import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CardsService } from '../cards/service/cards.service';
import { CreateCardDto } from '../cards/dto/create-card.dto';
import { UpdateCardDto } from '../cards/dto/update-card.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
//@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateCardDto) {
    return this.cardsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.cardsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.cardsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.cardsService.remove(req.user.id, id);
  }
}