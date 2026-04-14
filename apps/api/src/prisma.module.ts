import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useValue: new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
      }),
    },
  ],
  exports: [PrismaClient],
})
export default class PrismaModule {}
