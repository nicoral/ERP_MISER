import { createApiCall } from './httpInterceptor';
import type { ExitPart } from '../../types/exitPart';
import type {
  CreateExitPartDto,
  UpdateExitPartDto,
} from '../../types/exitPart';
import type { PaginatedResponse } from '../../types/generic';
import type { EntryPartType } from '../../types/entryPart';

const BASE_URL = `${import.meta.env.VITE_API_URL}/exit-parts`;

export const exitPartService = {
  async getExitParts(
    page: number,
    limit: number,
    type: EntryPartType
  ): Promise<PaginatedResponse<ExitPart>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('type', type);

    const response = await createApiCall<PaginatedResponse<ExitPart>>(
      `${BASE_URL}?${queryParams.toString()}`,
      {
        method: 'GET',
      }
    );
    return {
      data: response.data,
      total: response.total,
      page: page,
      pageSize: limit,
      totalPages: Math.ceil(response.total / limit),
    };
  },

  async getExitPart(id: number): Promise<ExitPart> {
    const response = await createApiCall<ExitPart>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createExitPart(data: CreateExitPartDto): Promise<ExitPart> {
    const response = await createApiCall<ExitPart>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async updateExitPart(id: number, data: UpdateExitPartDto): Promise<ExitPart> {
    const response = await createApiCall<ExitPart>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  async uploadExitPartImage(id: number, file: File): Promise<ExitPart> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<ExitPart>(
      `${BASE_URL}/${id}/image`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async getExitPartReceptionConformity(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/${id}/reception-conformity`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async downloadExitPartPdf(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/${id}/exit-part`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getExitParts = exitPartService.getExitParts;
export const getExitPart = exitPartService.getExitPart;
export const createExitPart = exitPartService.createExitPart;
