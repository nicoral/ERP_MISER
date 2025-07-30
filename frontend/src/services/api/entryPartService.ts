import { createApiCall } from './httpInterceptor';
import type {
  EntryPart,
  CreateEntryPartDto,
  UpdateEntryPartDto,
} from '../../types/entryPart';
import { EntryPartType } from '../../types/entryPart';
import type { PaginatedResponse } from '../../types/generic';

const BASE_URL = `${import.meta.env.VITE_API_URL}/entry-parts`;

export const entryPartService = {
  async getEntryParts(
    page: number,
    limit: number,
    type: EntryPartType
  ): Promise<PaginatedResponse<EntryPart>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('type', type);

    const response = await createApiCall<PaginatedResponse<EntryPart>>(
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

  async getEntryPart(id: number): Promise<EntryPart> {
    const response = await createApiCall<EntryPart>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createEntryPart(data: CreateEntryPartDto): Promise<EntryPart> {
    const response = await createApiCall<EntryPart>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async updateEntryPart(
    id: number,
    data: UpdateEntryPartDto
  ): Promise<EntryPart> {
    const response = await createApiCall<EntryPart>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  async uploadEntryPartImage(id: number, file: File): Promise<EntryPart> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<EntryPart>(
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

  async getEntryPartReceptionConformity(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/${id}/reception-conformity`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async getEntryPartPdf(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/${id}/entry-part`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getEntryParts = entryPartService.getEntryParts;
export const getEntryPart = entryPartService.getEntryPart;
export const createEntryPart = entryPartService.createEntryPart;
