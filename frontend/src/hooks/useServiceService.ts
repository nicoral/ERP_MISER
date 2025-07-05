import { useEffect, useState } from 'react';
import { getServices } from '../services/api/serviceService';
import type { Service } from '../types/service';

export const useServiceService = (search?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await getServices(1, 1000, search);
        setServices(response.data);
      } catch (error) {
        setError('Error al cargar los servicios');
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [search]);

  return { services, loading, error };
};
