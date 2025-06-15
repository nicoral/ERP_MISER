import type { User } from './user';
import type { ApiResponse } from './generic';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse<User> {
  token: string;
}

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
