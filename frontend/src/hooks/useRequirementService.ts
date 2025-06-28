import { useState } from 'react';
import {
  getRequirements,
  getRequirement,
} from '../services/api/requirementService';
import type { Requirement } from '../types/requirement';

interface RequirementsResponse {
  requirements: Requirement[];
  total: number;
}

export const useRequirementService = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirements = async (page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response: RequirementsResponse = await getRequirements(page, limit);
      setRequirements(response.requirements);
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar requerimientos'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirement = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const requirement = await getRequirement(id);
      setSelectedRequirement(requirement);
      return requirement;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar requerimiento'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedRequirement = () => {
    setSelectedRequirement(null);
  };

  return {
    requirements,
    selectedRequirement,
    loading,
    error,
    fetchRequirements,
    fetchRequirement,
    clearSelectedRequirement,
  };
};
