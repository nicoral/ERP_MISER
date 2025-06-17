import { useState, useEffect } from 'react';
import {
  getRequirement,
  getRequirements,
} from '../../../services/api/requirementService';
import type { Requirement } from '../../../types/requirement';

export const useRequirements = (initialPage = 1, initialPageSize = 10) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const fetchRequirements = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const response = await getRequirements(page, pageSize);
      setRequirements(response.requirements);
      setPagination({
        page,
        pageSize,
        total: response.total,
        totalPages: Math.ceil(response.total / pageSize),
      });
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements(initialPage, initialPageSize);
  }, [initialPage, initialPageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchRequirements(newPage, pagination.pageSize);
  };

  return {
    requirements,
    loading,
    pagination,
    handlePageChange,
    refetch: () => fetchRequirements(pagination.page, pagination.pageSize),
  };
};

export const useRequirementService = (id: number) => {
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        setLoading(true);
        const response = await getRequirement(id);
        setRequirement(response);
      } catch (error) {
        setError('Error al cargar el requerimiento');
        console.error('Error fetching requirement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirement();
  }, [id]);

  return { requirement, loading, error };
};
