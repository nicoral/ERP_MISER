import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  Article,
  ArticleCreate,
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
  if (filters?.name) {
    queryParams.append('name', filters.name);
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

export async function createArticle(article: ArticleCreate): Promise<Article> {
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
  article: Omit<Article, 'id'>
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

export async function createBrand(brand: Brand): Promise<Brand> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/articles/brands`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(brand),
    }
  );
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
}
