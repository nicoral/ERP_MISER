import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  Article,
  ArticleCreateDto,
  ArticleFilters,
  Brand,
} from '../../types/article';
import type { PaginatedResponse } from '../../types/generic';

export async function getArticles(
  page: number = 1,
  pageSize: number = 10,
  filters?: ArticleFilters
): Promise<PaginatedResponse<Article>> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());
  if (filters?.search) {
    queryParams.append('search', filters.search);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return {
      data: data.data,
      total: data.total,
      page: data.page,
      pageSize: data.limit,
      totalPages: Math.ceil(data.total / data.limit),
    };
  }
  throw new Error(data.message);
}

export async function getArticlesSimple(search?: string): Promise<Article[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/list/simple?search=${search}`,
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

export async function getArticle(
  id: number | undefined
): Promise<Article | null> {
  if (!id) {
    return null;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/${id}`,
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

export async function createArticle(
  article: ArticleCreateDto
): Promise<Article> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(article),
  });
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
}

export async function updateArticle(
  id: number,
  article: ArticleCreateDto
): Promise<Article> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(article),
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
}

export async function uploadArticleImage(
  id: number,
  file: File
): Promise<Article> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/${id}/image`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
}

export async function getBrands(): Promise<Brand[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/brands`,
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

export const createBrand = async (
  brand: Brand,
  file?: File
): Promise<Brand> => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('name', brand.name);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/brands`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
};

export const deleteArticle = async (id: number): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status !== 200) {
    const data = await response.json();
    throw new Error(data.message || 'Error al eliminar el artículo');
  }
};

export const downloadArticleTemplate = async (): Promise<Blob> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/import/template`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status === 200) {
    return response.blob();
  }

  const data = await response.json();
  throw new Error(data.message || 'Error al descargar el template');
};

export interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

export const importArticlesFromExcel = async (
  file: File
): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/import/excel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (response.status === 200 || response.status === 201) {
    return data;
  }

  throw new Error(data.message || 'Error al importar artículos');
};
