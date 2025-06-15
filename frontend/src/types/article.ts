import type { Warehouse } from './warehouse';

export interface Article {
  id: number;
  name: string;
  code: string;
  unitOfMeasure: string;
  line: string;
  shelf: string;
  type: string;
  rotationClassification: string;
  minStock: number;
  maxStock: number;
  active: boolean;
  imageUrl?: string;
  warehouseArticles: WarehouseStock[];
  brand: Brand;
}

export interface Brand {
  id: number;
  name: string;
  imageUrl?: string;
}

export type ArticleCreate = Omit<Article, 'id'>;

export interface ArticleFilters {
  code?: string;
  name?: string;
}

export interface WarehouseStockCreate {
  warehouseId: number;
  articleId?: number;
  stock: number;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  article: Article;
  stock: number;
}

export interface ArticleCreateDto {
  name: string;
  code: string;
  unitOfMeasure: string;
  line: string;
  shelf: string;
  type: string;
  rotationClassification: string;
  minStock: number;
  maxStock: number;
  active: boolean;
  brandId: number;
  imageUrl?: string;
  warehouseArticles: WarehouseStockCreate[];
}
