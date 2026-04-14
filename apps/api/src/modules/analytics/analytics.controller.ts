import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import AnalyticsService from './analytics.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export default class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('history')
  async getHistory(@Request() req: any, @Query('period') period: string) {
    return this.analyticsService.getParticipationHistory(req.user.userId, period);
  }

  @Get('roi')
  async getRoi(@Request() req: any) {
    return this.analyticsService.getRoi(req.user.userId);
  }

  @Get('benchmarks')
  async getBenchmarks() {
    return this.analyticsService.getBenchmarks();
  }
}
