import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(user: { id: string; email: string }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_SERCRET'),
        expiresIn: '15m',
      },
    );
  }

  async generateRefreshToken(userId: string) {
    return this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  async verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }
}
