import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import UsersService from './users.service';
import JwtAuthGuard from '../auth/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export default class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put()
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.userId, body);
  }
}
