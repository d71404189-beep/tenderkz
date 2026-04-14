import { Controller, Get, Post, Query, Param, UseGuards, Request } from '@nestjs/common';
import TendersService from './tenders.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('tenders')
@UseGuards(JwtAuthGuard)
export default class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    return this.tendersService.findAll(query, req.user.userId);
  }

  @Get('recommended')
  async getRecommended(@Request() req: any) {
    return this.tendersService.getRecommended(req.user.userId);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.tendersService.getDashboardStats(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id);
  }

  @Post('sync')
  async triggerSync() {
    return this.tendersService.triggerSync();
  }
}
