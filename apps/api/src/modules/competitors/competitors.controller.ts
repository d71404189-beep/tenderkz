import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import CompetitorsService from './competitors.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('competitors')
@UseGuards(JwtAuthGuard)
export default class CompetitorsController {
  constructor(private readonly compService: CompetitorsService) {}

  @Get()
  async getByCategory(@Query('kpgz') kpgz: string) {
    return this.compService.getCompetitorsByCategory(kpgz);
  }

  @Get('heatmap')
  async getHeatmap() {
    return this.compService.getCompetitionHeatmap();
  }

  @Get(':bin')
  async getByBin(@Param('bin') bin: string) {
    return this.compService.getCompetitorByBin(bin);
  }
}
