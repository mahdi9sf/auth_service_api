import { User } from '@prisma/client';

export type UserResponse = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName'
>;
