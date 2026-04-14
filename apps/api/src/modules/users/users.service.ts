import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class UsersService {
  constructor(private prisma: PrismaClient) {}

  async getProfile(userId: string) {
    return this.prisma.companyProfile.findUnique({
      where: { userId },
    });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.companyProfile.upsert({
      where: { userId },
      update: {
        bin: data.bin,
        name: data.name,
        directorName: data.directorName,
        region: data.region,
        oked: data.oked,
        categories: data.categories || [],
        licenses: data.licenses || [],
        certificates: data.certificates || [],
        experience: data.experience || [],
      },
      create: {
        userId,
        bin: data.bin || '',
        name: data.name || '',
        directorName: data.directorName,
        region: data.region,
        oked: data.oked,
        categories: data.categories || [],
        licenses: data.licenses || [],
        certificates: data.certificates || [],
        experience: data.experience || [],
      },
    });
  }
}
