import type { Employee } from './employee';
import type { Article } from './article';
import type { PurchaseOrder } from './purchaseOrder';
import type { Warehouse } from './warehouse';

export enum ExitPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface ExitPart {
  id: number;
  code: string;
  status: ExitPartStatus;
  imageUrl?: string;
  observation?: string;
  exitDate: string;
  purchaseOrder?: PurchaseOrder;
  employee: Employee;
  warehouse?: Warehouse;
  exitPartArticles: ExitPartArticle[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ExitPartArticle {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  delivered: number;
  conform: boolean;
  qualityCert: boolean;
  guide: boolean;
  inspection: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  article: Article;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateExitPartDto {
  code?: string;
  imageUrl?: string;
  observation?: string;
  exitDate: string;
  purchaseOrderId?: string;
  employeeId: string;
  warehouseId?: number;
  exitPartArticles: CreateExitPartArticleDto[];
}

export interface UpdateExitPartDto {
  observation?: string;
  exitDate?: string;
  employeeId?: number;
  exitPartArticles?: UpdateExitPartArticleDto[];
}

export interface CreateExitPartArticleDto {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  delivered: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: number;
}

export interface UpdateExitPartArticleDto {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  delivered: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: number;
}
