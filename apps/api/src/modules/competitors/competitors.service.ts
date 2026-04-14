import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class CompetitorsService {
  constructor(private prisma: PrismaClient) {}

  async getCompetitorByBin(bin: string) {
    let profile = await this.prisma.competitorProfile.findUnique({ where: { bin } });

    if (!profile) {
      profile = await this.rebuildCompetitorProfile(bin);
    }

    return profile;
  }

  async getCompetitorsByCategory(kpgz: string) {
    if (!kpgz) {
      return this.prisma.competitorProfile.findMany({
        orderBy: { totalWon: 'desc' },
        take: 50,
      });
    }

    return this.prisma.competitorProfile.findMany({
      where: { categories: { has: kpgz } },
      orderBy: { totalWon: 'desc' },
      take: 50,
    });
  }

  async getCompetitionHeatmap() {
    const result = await this.prisma.$queryRaw<Array<{ category_kpgz: string; participant_count: number }>>`
      SELECT category_kpgz, COUNT(DISTINCT supplier_bin) as participant_count
      FROM tender_participants
      GROUP BY category_kpgz
      ORDER BY participant_count ASC
      LIMIT 100
    `;

    const heatmap: Record<string, number> = {};
    for (const row of result) {
      if (row.category_kpgz) {
        heatmap[row.category_kpgz] = Number(row.participant_count);
      }
    }

    return heatmap;
  }

  private async rebuildCompetitorProfile(bin: string) {
    const participations = await this.prisma.tenderParticipant.findMany({
      where: { supplierBin: bin },
      include: { tender: true },
    });

    const totalParticipated = participations.length;
    const won = participations.filter((p) => p.isWinner);
    const totalWon = won.length;
    const winRate = totalParticipated > 0 ? totalWon / totalParticipated : 0;
    const avgDiscount =
      participations.length > 0
        ? participations.reduce((sum, p) => sum + (p.discount || 0), 0) / participations.length
        : 0;

    const categories = [...new Set(participations.map((p) => p.tender.categoryKpgz).filter(Boolean))] as string[];
    const name = participations[0]?.supplierName || '';
    const region = '';

    return this.prisma.competitorProfile.upsert({
      where: { bin },
      update: {
        name,
        region,
        totalParticipated,
        totalWon,
        winRate,
        avgDiscount,
        categories,
      },
      create: {
        bin,
        name,
        region,
        totalParticipated,
        totalWon,
        winRate,
        avgDiscount,
        categories,
      },
    });
  }
}
