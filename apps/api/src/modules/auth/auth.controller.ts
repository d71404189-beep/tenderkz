import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import AuthService from './auth.service';
import JwtAuthGuard from './jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}
