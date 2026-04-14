import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import GoszakupkiParser from './goszakupki.parser';

@Injectable()
export default class TendersService {
  private readonly logger = new Logger(TendersService.name);
  private seeded = false;

  constructor(
    private prisma: PrismaClient,
    private parser: GoszakupkiParser,
  ) {}

  async findAll(filters: any, userId: string) {
    await this.ensureData();

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { categoryKpgz: { contains: filters.search, mode: 'insensitive' } },
        { categoryKtru: { contains: filters.search, mode: 'insensitive' } },
        { region: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.region?.length) where.region = { in: filters.region };
    if (filters.type?.length) where.type = { in: filters.type };
    if (filters.status?.length) where.status = { in: filters.status };

    if (filters.amountMin || filters.amountMax) {
      where.amount = {};
      if (filters.amountMin) where.amount.gte = filters.amountMin;
      if (filters.amountMax) where.amount.lte = filters.amountMax;
    }

    if (filters.deadlineFrom || filters.deadlineTo) {
      where.deadlineAt = {};
      if (filters.deadlineFrom) where.deadlineAt.gte = new Date(filters.deadlineFrom);
      if (filters.deadlineTo) where.deadlineAt.lte = new Date(filters.deadlineTo);
    }

    if (filters.categoryKpgz?.length) where.categoryKpgz = { in: filters.categoryKpgz };

    return this.prisma.tender.findMany({
      where,
      orderBy: { deadlineAt: 'asc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    return this.prisma.tender.findUnique({
      where: { id },
      include: { participants: true },
    });
  }

  async getRecommended(userId: string) {
    await this.ensureData();

    const profile = await this.prisma.companyProfile.findUnique({ where: { userId } });

    if (!profile) {
      return this.prisma.tender.findMany({
        where: { status: { in: ['PUBLISHED', 'RECEIVING'] } },
        orderBy: { deadlineAt: 'asc' },
        take: 10,
      });
    }

    const categories = profile.categories || [];
    const region = profile.region;

    return this.prisma.tender.findMany({
      where: {
        status: { in: ['PUBLISHED', 'RECEIVING'] },
        OR: [
          ...(categories.length > 0 ? [{ categoryKpgz: { in: categories } }] : []),
          ...(region ? [{ region }] : []),
        ],
      },
      orderBy: { deadlineAt: 'asc' },
      take: 10,
    });
  }

  async getDashboardStats(userId: string) {
    await this.ensureData();

    const [activeTenders, profile] = await Promise.all([
      this.prisma.tender.count({ where: { status: { in: ['PUBLISHED', 'RECEIVING'] } } }),
      this.prisma.companyProfile.findUnique({ where: { userId } }),
    ]);

    const participations = profile
      ? await this.prisma.tenderParticipant.findMany({
          where: { supplierBin: profile.bin, isWinner: true },
          include: { tender: true },
        })
      : [];

    const submitted = profile
      ? await this.prisma.tenderParticipant.count({ where: { supplierBin: profile.bin } })
      : 0;

    const won = participations.length;
    const totalRevenue = participations.reduce((sum, p) => sum + Number(p.tender.amount || 0), 0);

    const recommended = await this.getRecommended(userId);

    const notifications = await this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      activeTenders,
      submittedApplications: submitted,
      wonTenders: won,
      winRate: submitted > 0 ? Math.round((won / submitted) * 100) : 0,
      totalRevenue,
      avgDiscount: 0,
      upcomingDeadlines: notifications,
      recommendedTenders: recommended,
    };
  }

  async triggerSync() {
    this.logger.log('Sync triggered — fetching from goszakupki.kz');
    try {
      const tenders = await this.parser.fetchPublishedTenders(0, 50);
      let upserted = 0;
      for (const tender of tenders) {
        if (!tender.externalId) continue;
        try {
          await this.prisma.tender.upsert({
            where: { externalId: tender.externalId },
            update: tender,
            create: tender,
          });
          upserted++;
        } catch (e: any) {
          this.logger.warn(`Failed to upsert ${tender.externalId}: ${e.message}`);
        }
      }
      this.logger.log(`Sync completed: ${upserted} tenders upserted`);
      return { status: 'sync_completed', upserted };
    } catch (e: any) {
      this.logger.error(`Sync failed: ${e.message}`);
      return { status: 'sync_failed', error: e.message };
    }
  }

  async upsertTender(data: any) {
    return this.prisma.tender.upsert({
      where: { externalId: data.externalId },
      update: data,
      create: data,
    });
  }

  private async ensureData() {
    if (this.seeded) return;

    const count = await this.prisma.tender.count();
    if (count > 0) {
      this.seeded = true;
      return;
    }

    this.logger.log('Database empty — seeding demo tenders...');
    const tenders = await this.parser.fetchPublishedTenders(0, 50);
    for (const tender of tenders) {
      if (!tender.externalId) continue;
      try {
        await this.prisma.tender.upsert({
          where: { externalId: tender.externalId },
          update: tender,
          create: tender,
        });
      } catch (e: any) {
        this.logger.warn(`Failed to seed ${tender.externalId}: ${e.message}`);
      }
    }
    this.seeded = true;
    this.logger.log(`Seeded ${tenders.length} demo tenders`);
  }
}
