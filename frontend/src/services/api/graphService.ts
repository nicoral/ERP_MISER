import type {
  GraphDistribution,
  GraphDistributionRequirements,
} from '../../types/graph';
import { createApiCall } from './httpInterceptor';

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const graphService = {
  async getGraphDistribution() {
    const response = await createApiCall<GraphDistribution[]>(
      `${BASE_URL}/roles/graph/distribution`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getGraphDistributionRequirements() {
    const response = await createApiCall<GraphDistributionRequirements[]>(
      `${BASE_URL}/requirements/graph/distribution`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getGraphDistribution = graphService.getGraphDistribution;
export const getGraphDistributionRequirements =
  graphService.getGraphDistributionRequirements;
