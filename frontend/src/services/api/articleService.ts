import { createApiCall } from './httpInterceptor';
import type {
  Article,
  ArticleCreateDto,
  ArticleFilters,
  Brand,
} from '../../types/article';
import type { PaginatedResponse } from '../../types/generic';

const BASE_URL = `${import.meta.env.VITE_API_URL}/articles`;

export const articleService = {
  async getArticles(
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

    const response = await createApiCall<{
      data: Article[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  },

  async getArticlesSimple(search?: string): Promise<Article[]> {
    const response = await createApiCall<Article[]>(
      `${BASE_URL}/list/simple?search=${search}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getArticle(id: number | undefined): Promise<Article | null> {
    if (!id) {
      return null;
    }

    const response = await createApiCall<Article>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createArticle(article: ArticleCreateDto): Promise<Article> {
    const response = await createApiCall<Article>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(article),
    });
    return response;
  },

  async updateArticle(id: number, article: ArticleCreateDto): Promise<Article> {
    const response = await createApiCall<Article>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
    return response;
  },

  async uploadArticleImage(id: number, file: File): Promise<Article> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<Article>(`${BASE_URL}/${id}/image`, {
      method: 'POST',
      body: formData,
    });
    return response;
  },

  async getBrands(): Promise<Brand[]> {
    const response = await createApiCall<Brand[]>(`${BASE_URL}/brands`, {
      method: 'GET',
    });
    return response;
  },

  async createBrand(brand: Brand, file?: File): Promise<Brand> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('name', brand.name);

    const response = await createApiCall<Brand>(`${BASE_URL}/brands`, {
      method: 'POST',
      body: formData,
    });
    return response;
  },

  async deleteArticle(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  async downloadArticleTemplate(): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/import/template`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async importArticlesFromExcel(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<ImportResult>(
      `${BASE_URL}/import/excel`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return response;
  },
};

export interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

// Legacy exports for backward compatibility
export const getArticles = articleService.getArticles;
export const getArticlesSimple = articleService.getArticlesSimple;
export const getArticle = articleService.getArticle;
export const createArticle = articleService.createArticle;
export const updateArticle = articleService.updateArticle;
export const uploadArticleImage = articleService.uploadArticleImage;
export const getBrands = articleService.getBrands;
export const createBrand = articleService.createBrand;
export const deleteArticle = articleService.deleteArticle;
export const downloadArticleTemplate = articleService.downloadArticleTemplate;
export const importArticlesFromExcel = articleService.importArticlesFromExcel;
