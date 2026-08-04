import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { PasswordService } from 'src/common/password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    dto.password = hashedPassword;

    const user = await this.usersService.create(dto);

    return {
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
