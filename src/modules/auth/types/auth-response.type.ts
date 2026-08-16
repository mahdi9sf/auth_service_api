import { UserResponse } from 'src/modules/users/types/user-response.type';

export type AuthResponse = {
  user: UserResponse;
  accessToken?: string;
  refreshToken?: string;
};
