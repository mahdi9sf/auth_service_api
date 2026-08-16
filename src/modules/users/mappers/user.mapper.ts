import { User } from '@prisma/client';

export class UserMapper {
  static toResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
