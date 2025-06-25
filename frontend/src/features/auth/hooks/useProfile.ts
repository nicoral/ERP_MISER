import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../services/auth/authService';

export interface ProfileData {
  id: number;
  email: string;
  documentId: string;
  phone: string;
  signature?: string;
  firstName: string;
  lastName: string;
  position: string;
  area: string | null;
  imageUrl?: string;
}

export const useProfile = () => {
  return useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
