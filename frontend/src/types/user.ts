export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  role: Role;
}
