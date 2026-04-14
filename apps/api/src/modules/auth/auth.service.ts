import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export default class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        bin: dto.bin,
        name: dto.name,
      },
    });

    if (dto.bin) {
      await this.prisma.companyProfile.create({
        data: {
          userId: user.id,
          bin: dto.bin,
          name: dto.name || '',
        },
      });
    }

    const token = this.jwt.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = this.jwt.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new Error('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }
}
