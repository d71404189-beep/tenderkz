import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaClient,
  ) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  async createNotification(data: {
    userId: string;
    tenderId?: string;
    type: string;
    title: string;
    message: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async checkDeadlines() {
    this.logger.log('Checking upcoming deadlines...');

    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      include: { profile: true },
    });

    for (const user of users) {
      if (!user.profile) continue;

      const activeTenders = await this.prisma.tenderParticipant.findMany({
        where: {
          supplierBin: user.profile.bin,
          isWinner: false,
        },
        include: { tender: true },
      });

      for (const participation of activeTenders) {
        const tender = participation.tender;
        const deadline = new Date(tender.deadlineAt);

        await this.checkAndNotify(user.id, tender.id, deadline, now, in72h, 'DEADLINE_72H', `Дедлайн через 72 часа: ${tender.title}`);
        await this.checkAndNotify(user.id, tender.id, deadline, now, in24h, 'DEADLINE_24H', `Дедлайн через 24 часа: ${tender.title}`);
        await this.checkAndNotify(user.id, tender.id, deadline, now, in3h, 'DEADLINE_3H', `ВНИМАНИЕ! Дедлайн через 3 часа: ${tender.title}`);
      }
    }
  }

  private async checkAndNotify(
    userId: string,
    tenderId: string,
    deadline: Date,
    now: Date,
    threshold: Date,
    type: string,
    title: string,
  ) {
    if (now < deadline && deadline <= threshold) {
      const existing = await this.prisma.notification.findFirst({
        where: { userId, tenderId, type },
      });

      if (!existing) {
        await this.createNotification({
          userId,
          tenderId,
          type,
          title,
          message: `Срок подачи заявки: ${deadline.toLocaleDateString('ru-RU')}`,
        });
      }
    }
  }
}
