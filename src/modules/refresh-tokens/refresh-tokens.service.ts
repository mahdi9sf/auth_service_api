import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
      },
    });
  }

  async find(data: RefreshToken) {
    return this.prisma.refreshToken.findUnique({
      where: data,
    });
  }

  async findByToken(hashedRefreshToken: string) {
    return this.prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashedRefreshToken,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }
}
