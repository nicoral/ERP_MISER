import type { Employee } from './employee';
import type { Article } from './article';
import type { Service } from './service';
import type { PurchaseOrder } from './purchaseOrder';
import type { Warehouse } from './warehouse';

export enum EntryPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum EntryPartType {
  ARTICLE = 'ARTICLE',
  SERVICE = 'SERVICE',
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface EntryPart {
  id: number;
  code: string;
  status: EntryPartStatus;
  imageUrl?: string;
  observation?: string;
  entryDate: string;
  type: EntryPartType;
  purchaseOrder?: PurchaseOrder;
  employee: Employee;
  warehouse?: Warehouse;
  entryPartArticles: EntryPartArticle[];
  entryPartServices: EntryPartService[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface EntryPartService {
  id: number;
  code: string;
  name: string;
  duration: number;
  durationType: string;
  received: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: InspectionStatus;
  observation?: string;
  service: Service;
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
  inspection: InspectionStatus;
  observation?: string;
  article: Article;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateEntryPartDto {
  observation?: string;
  entryDate: string;
  employeeId?: number;
  warehouseId: number;
  purchaseOrderId?: number;
  entryPartArticles: CreateEntryPartArticleDto[];
  entryPartServices?: CreateEntryPartServiceDto[];
}

export interface UpdateEntryPartDto {
  observation?: string;
  entryDate?: string;
  employeeId?: number;
  entryPartArticles?: UpdateEntryPartArticleDto[];
  entryPartServices?: UpdateEntryPartServiceDto[];
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
  inspection?: InspectionStatus;
  observation?: string;
  articleId: number;
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
  inspection?: InspectionStatus;
  observation?: string;
  articleId: number;
}

export interface CreateEntryPartServiceDto {
  code: string;
  name: string;
  duration: number;
  durationType: string;
  received: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: InspectionStatus;
  observation?: string;
  serviceId: number;
}

export interface UpdateEntryPartServiceDto {
  id: number;
  code: string;
  name: string;
  duration: number;
  durationType: string;
  received: number;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: InspectionStatus;
  observation?: string;
  serviceId: number;
}
