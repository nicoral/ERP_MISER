import { createApiCall } from './httpInterceptor';
import type {
  CreateRequirementDto,
  Requirement,
} from '../../types/requirement';

interface RequirementsResponse {
  requirements: Requirement[];
  total: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/requirements`;

export const requirementService = {
  async getRequirements(
    page = 1,
    limit = 10,
    type?: 'ARTICLE' | 'SERVICE'
  ): Promise<RequirementsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    const response = await createApiCall<RequirementsResponse>(
      `${BASE_URL}?${params.toString()}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getRequirement(id: number): Promise<Requirement> {
    const response = await createApiCall<Requirement>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createRequirement(
    requirement: CreateRequirementDto
  ): Promise<Requirement> {
    const response = await createApiCall<Requirement>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(requirement),
    });
    return response;
  },

  async updateRequirement(
    id: number,
    requirement: CreateRequirementDto
  ): Promise<Requirement> {
    const response = await createApiCall<Requirement>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requirement),
    });
    return response;
  },

  async generateRequirementPdf(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/generate/pdf/${id}`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async publishRequirement(id: number): Promise<Requirement> {
    const response = await createApiCall<Requirement>(
      `${BASE_URL}/publish/${id}`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  async signRequirement(id: number): Promise<Requirement> {
    const response = await createApiCall<Requirement>(
      `${BASE_URL}/sign/${id}`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  async rejectRequirement(id: number, reason: string): Promise<Requirement> {
    const response = await createApiCall<Requirement>(
      `${BASE_URL}/reject/${id}`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return response;
  },

  async deleteRequirement(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  async uploadInform(id: number, inform: File): Promise<Requirement> {
    const formData = new FormData();
    formData.append('inform', inform);

    const response = await createApiCall<Requirement>(
      `${BASE_URL}/upload-inform/${id}`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getRequirements = requirementService.getRequirements;
export const getRequirement = requirementService.getRequirement;
export const createRequirement = requirementService.createRequirement;
export const updateRequirement = requirementService.updateRequirement;
export const generateRequirementPdf = requirementService.generateRequirementPdf;
export const publishRequirement = requirementService.publishRequirement;
export const signRequirement = requirementService.signRequirement;
export const deleteRequirement = requirementService.deleteRequirement;
export const rejectRequirement = requirementService.rejectRequirement;
export const uploadInform = requirementService.uploadInform;
