import type { User } from '../../types/user';

const MOCK_USER: User = {
  id: 1,
  name: 'Admin',
  email: 'admin@demo.com',
  role: 'admin',
};

const STORAGE_KEY = 'emixio_user';

export async function login(email: string, password: string): Promise<User> {
  // Simulación de login
  await new Promise(resolve => setTimeout(resolve, 500));
  if (email === 'admin@demo.com' && password === 'admin') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
    return MOCK_USER;
  }
  throw new Error('Credenciales inválidas');
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
} 