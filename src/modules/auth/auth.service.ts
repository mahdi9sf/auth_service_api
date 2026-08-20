import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { PasswordService } from 'src/common/password/password.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { TokenService } from './token/token.service';
import { UserMapper } from '../users/mappers/user.mapper';
import { ApiResponse } from 'src/common/types/api-response.type';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly tokenService: TokenService,
  ) {}

  private buildAuthResponse(
    message: string,
    user: User,
    accessToken?: string,
    refreshToken?: string,
  ): ApiResponse<AuthResponse> {
    return {
      success: true,
      message,
      data: {
        accessToken,
        user: UserMapper.toResponse(user),
        refreshToken,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    dto.password = hashedPassword;

    const user = await this.usersService.create(dto);

    const accessToken = await this.tokenService.generateAccessToken(user);

    return this.buildAuthResponse(
      'User created successfully',
      user,
      accessToken,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const compare = await this.passwordService.compare(
      dto.password,
      user.password,
    );

    if (!compare) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.tokenService.generateAccessToken(user);

    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    const refreshTokenHash = this.passwordService.hashToken(refreshToken);

    await this.refreshTokensService.create(
      user.id,
      refreshTokenHash,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return this.buildAuthResponse(
      'User successfully logged in',
      user,
      accessToken,
      refreshToken,
    );
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    const hashedRefreshToken = this.passwordService.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokensService.findByToken(hashedRefreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = await this.tokenService.generateAccessToken(user);

    const newRefreshToken = await this.tokenService.generateRefreshToken(
      user.id,
    );

    const newRefreshTokenHash = this.passwordService.hashToken(newRefreshToken);

    await this.refreshTokensService.delete(storedToken.id);

    await this.refreshTokensService.create(
      user.id,
      newRefreshTokenHash,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return this.buildAuthResponse(
      'Token refreshed successfully',
      user,
      accessToken,
      newRefreshToken,
    );
  }

  async logout(refreshToken: string) {
    const hashedRefreshToken = this.passwordService.hashToken(refreshToken);

    const storedToken =
      await this.refreshTokensService.findByToken(hashedRefreshToken);

    if (!storedToken) {
      return {
        message: 'Logged out successfully',
      };
    }

    await this.refreshTokensService.delete(storedToken.id);

    return {
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildAuthResponse('User fetched successfully', user);
  }
}
