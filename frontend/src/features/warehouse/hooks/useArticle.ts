import { useEffect, useState } from 'react';
import {
  getArticle,
  getArticles,
  getBrands,
} from '../../../services/api/articleService';
import type { Article, ArticleFilters } from '../../../types/article';
import type { PaginatedResponse } from '../../../types/generic';
import type { Brand as BrandType } from '../../../types/brand';

export const useArticles = (
  page: number = 1,
  pageSize: number = 10,
  filters?: ArticleFilters
) => {
  const [articles, setArticles] = useState<PaginatedResponse<Article> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getArticles(page, pageSize, filters);
        setArticles(response);
      } catch (error) {
        setError('Error al cargar los artículos');
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, pageSize, filters]);

  return {
    articles,
    loading,
    error,
  };
};

export const useArticle = (id: number | undefined) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await getArticle(id);
        setArticle(response);
      } catch (error) {
        setError('Error al cargar el artículo');
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  return { article, loading, error };
};

export function useBrands() {
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await getBrands();
      setBrands(response);
      return response;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar las marcas'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return { brands, loading, error, refreshBrands: fetchBrands };
}
