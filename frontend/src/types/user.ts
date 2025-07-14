import type { Employee } from './employee';

export interface Permission {
  id: number;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  employees?: Employee[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateRole {
  name: string;
  description: string;
  permissions: number[];
}

export type UpdateRole = Partial<CreateRole>;

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  signature?: string;
  role: Role;
}
