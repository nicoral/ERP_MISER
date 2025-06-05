export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
} 