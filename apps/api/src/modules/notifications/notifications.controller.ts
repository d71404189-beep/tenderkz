import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import NotificationsService from './notifications.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export default class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  async getAll(@Request() req: any) {
    return this.notifService.getUserNotifications(req.user.userId);
  }

  @Put(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notifService.markRead(id);
  }

  @Put('read-all')
  async markAllRead(@Request() req: any) {
    return this.notifService.markAllRead(req.user.userId);
  }
}
