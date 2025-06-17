import type { ReactNode } from 'react';

export type TableColumn<T> = {
  header: string;
  accessor?: keyof T | string;
  accessor2?: keyof T | string;
  render?: (row: T) => ReactNode;
  className?: string;
  isKey?: boolean;
};

export type TableAction<T> = {
  icon: ReactNode;
  label: string;
  onClick: (row: T) => void;
};

export type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  pagination?: TablePaginationProps;
  actions?: TableAction<T>[];
  pageSize?: number;
};
