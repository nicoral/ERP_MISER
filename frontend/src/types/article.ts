export interface Article {
  code: string;
  name: string;
  category: string;
  stock: number;
  active: boolean;
}

export interface ArticleFilters {
  code?: string;
  name?: string;
  category?: string;
}
