import type { Employee } from './employee';
import type { Article } from './article';
import type { PurchaseOrder } from './purchaseOrder';
import type { Warehouse } from './warehouse';

export enum EntryPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface EntryPart {
  id: number;
  code: string;
  status: EntryPartStatus;
  imageUrl?: string;
  observation?: string;
  entryDate: string;
  purchaseOrder?: PurchaseOrder;
  employee: Employee;
  warehouse?: Warehouse;
  entryPartArticles: EntryPartArticle[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface EntryPartArticle {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  received: number;
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

export interface CreateEntryPartDto {
  code?: string;
  imageUrl?: string;
  observation?: string;
  entryDate: string;
  purchaseOrderId?: string;
  employeeId: string;
  warehouseId?: number;
  entryPartArticles: CreateEntryPartArticleDto[];
}

export interface UpdateEntryPartDto {
  observation?: string;
  entryDate?: string;
  employeeId?: number;
  entryPartArticles?: UpdateEntryPartArticleDto[];
}

export interface CreateEntryPartArticleDto {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  received: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: string;
}

export interface UpdateEntryPartArticleDto {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  received: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: number;
}
