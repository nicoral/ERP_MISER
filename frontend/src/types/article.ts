import type { Warehouse } from './warehouse';

export interface Article {
  id: number;
  name: string;
  code: string;
  unitOfMeasure: string;
  type: string;
  rotationClassification: string;
  active: boolean;
  imageUrl?: string;
  warehouseArticles: WarehouseStock[];
  brand: Brand;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Brand {
  id: number;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ArticleCreate = Omit<Article, 'id'>;

export interface ArticleFilters {
  search?: string;
}

export interface WarehouseStockCreate {
  warehouseId: number;
  articleId?: number;
  stock: number;
  minStock: number;
  maxStock: number;
  line: string;
  shelf: string;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  article: Article;
  stock: number;
  minStock: number;
  maxStock: number;
  line: string;
  shelf: string;
}

export interface ArticleCreateDto {
  name: string;
  code: string;
  unitOfMeasure: string;
  type: string;
  rotationClassification: string;
  active: boolean;
  brandId: number;
  imageUrl?: string;
  warehouseArticles: WarehouseStockCreate[];
}
