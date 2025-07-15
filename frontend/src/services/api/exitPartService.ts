import { createApiCall } from './httpInterceptor';
import type { ExitPart } from '../../types/exitPart';
import type {
  CreateExitPartDto,
  UpdateExitPartDto,
} from '../../types/exitPart';

const BASE_URL = `${import.meta.env.VITE_API_URL}/exit-parts`;

export const exitPartService = {
  async getExitParts(): Promise<ExitPart[]> {
    const response = await createApiCall<ExitPart[]>(BASE_URL, {
      method: 'GET',
    });
    return response;
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
};

// Legacy exports for backward compatibility
export const getExitParts = exitPartService.getExitParts;
export const getExitPart = exitPartService.getExitPart;
export const createExitPart = exitPartService.createExitPart;
