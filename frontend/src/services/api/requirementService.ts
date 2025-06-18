import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  CreateRequirementDto,
  Requirement,
} from '../../types/requirement';

interface RequirementsResponse {
  requirements: Requirement[];
  total: number;
}

export async function getRequirements(
  page = 1,
  limit = 10
): Promise<RequirementsResponse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/requirements?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
}

export async function getRequirement(id: number) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/requirements/${id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
}

export async function createRequirement(requirement: CreateRequirementDto) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(requirement),
  });
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
}

export async function generateRequirementPdf(id: number) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/requirements/generate/pdf/${id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  if (response.status === 200) {
    return response.blob();
  }
  throw new Error('Error al generar el PDF');
}
