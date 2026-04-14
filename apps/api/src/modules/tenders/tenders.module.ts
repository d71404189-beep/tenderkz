import { Module } from '@nestjs/common';
import TendersController from './tenders.controller';
import TendersService from './tenders.service';
import GoszakupkiParser from './goszakupki.parser';

@Module({
  controllers: [TendersController],
  providers: [TendersService, GoszakupkiParser],
  exports: [TendersService],
})
export default class TendersModule {}
