import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import PrismaModule from './prisma.module';
import AuthModule from './modules/auth/auth.module';
import TendersModule from './modules/tenders/tenders.module';
import UsersModule from './modules/users/users.module';
import AnalyticsModule from './modules/analytics/analytics.module';
import DocumentsModule from './modules/documents/documents.module';
import NotificationsModule from './modules/notifications/notifications.module';
import CompetitorsModule from './modules/competitors/competitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TendersModule,
    UsersModule,
    AnalyticsModule,
    DocumentsModule,
    NotificationsModule,
    CompetitorsModule,
  ],
})
export default class AppModule {}
