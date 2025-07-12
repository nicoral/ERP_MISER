import { createApiCall } from './httpInterceptor';
import type { EntryPart } from '../../types/entryPart';
import type {
  CreateEntryPartDto,
  UpdateEntryPartDto,
} from '../../types/entryPart';

const BASE_URL = `${import.meta.env.VITE_API_URL}/entry-parts`;

export const entryPartService = {
  async getEntryParts(): Promise<EntryPart[]> {
    const response = await createApiCall<EntryPart[]>(BASE_URL, {
      method: 'GET',
    });
    return response;
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
};

// Legacy exports for backward compatibility
export const getEntryParts = entryPartService.getEntryParts;
export const getEntryPart = entryPartService.getEntryPart;
export const createEntryPart = entryPartService.createEntryPart;
