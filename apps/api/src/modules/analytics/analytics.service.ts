import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export default class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async getParticipationHistory(userId: string, period: string) {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const monthsMap: Record<string, number> = {
      '3m': 3, '6m': 6, '12m': 12, '24m': 24,
    };
    const months = monthsMap[period] || 12;
    const from = dayjs().subtract(months, 'month').toDate();

    const participations = await this.prisma.tenderParticipant.findMany({
      where: {
        supplierBin: profile.bin,
        tender: { publishedAt: { gte: from } },
      },
      include: { tender: true },
      orderBy: { tender: { publishedAt: 'desc' } },
    });

    const grouped: Record<string, any> = {};
    for (const p of participations) {
      const month = dayjs(p.tender.publishedAt).format('YYYY-MM');
      if (!grouped[month]) {
        grouped[month] = { period: month, submitted: 0, won: 0, totalWon: 0, avgDiscount: 0, discounts: [] };
      }
      grouped[month].submitted++;
      if (p.isWinner) {
        grouped[month].won++;
        grouped[month].totalWon += Number(p.tender.amount);
      }
      grouped[month].discounts.push(p.discount || 0);
    }

    return Object.values(grouped).map((g: any) => ({
      ...g,
      avgDiscount: g.discounts.length > 0
        ? Math.round(g.discounts.reduce((a: number, b: number) => a + b, 0) / g.discounts.length * 10) / 10
        : 0,
      discounts: undefined,
    }));
  }

  async getRoi(userId: string) {
    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) return { percent: 0, totalCost: 0, totalRevenue: 0, conversion: 0, byCategory: [] };

    const participations = await this.prisma.tenderParticipant.findMany({
      where: { supplierBin: profile.bin },
      include: { tender: true },
    });

    const totalCost = participations.reduce(
      (sum, p) => sum + Number(p.tender.guaranteeAmount || 0), 0,
    );

    const wins = participations.filter((p) => p.isWinner);
    const totalRevenue = wins.reduce((sum, p) => sum + Number(p.tender.amount), 0);
    const conversion = participations.length > 0
      ? Math.round((wins.length / participations.length) * 100)
      : 0;

    const byCategory: Record<string, number> = {};
    for (const w of wins) {
      const cat = w.tender.categoryKpgz || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + Number(w.tender.amount);
    }

    return {
      percent: totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0,
      totalCost,
      totalRevenue,
      conversion,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    };
  }

  async getBenchmarks() {
    const avgWinRate = await this.prisma.tenderParticipant.aggregate({
      _avg: { discount: true },
    });

    const totalSuppliers = await this.prisma.tenderParticipant.groupBy({
      by: ['supplierBin'],
      _count: { supplierBin: true },
      _sum: { discount: true },
      orderBy: { _count: { supplierBin: 'desc' } },
      take: 100,
    });

    return {
      avgMarketDiscount: avgWinRate._avg.discount || 0,
      topSuppliersCount: totalSuppliers.length,
    };
  }
}
