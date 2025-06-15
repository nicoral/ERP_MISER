// Tipos genéricos para respuestas de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Tipos genéricos para formularios
export interface BaseFormProps {
  label?: string;
  error?: string;
  id?: string;
  className?: string;
}

// Tipos genéricos para filtros
export interface BaseFilters {
  page?: number;
  pageSize?: number;
}
