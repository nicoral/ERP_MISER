import { useEffect, useState } from 'react';
import { getArticlesSimple } from '../services/api/articleService';
import type { Article } from '../types/article';

export const useArticleService = (search?: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getArticlesSimple(search);
        setArticles(response);
      } catch (error) {
        setError('Error al cargar los artículos');
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [search]);

  return { articles, loading, error };
};
