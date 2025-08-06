import type { Employee } from './employee';
import type { Article } from './article';
import type { Service } from './service';
import type { PurchaseOrder } from './purchaseOrder';
import type { Warehouse } from './warehouse';

export enum ExitPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum ExitPartType {
  ARTICLE = 'ARTICLE',
  SERVICE = 'SERVICE',
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface ExitPart {
  id: number;
  code: string;
  status: ExitPartStatus;
  imageUrl?: string;
  observation?: string;
  exitDate: string;
  type: ExitPartType;
  purchaseOrder?: PurchaseOrder;
  employee: Employee;
  warehouse?: Warehouse;
  exitPartArticles: ExitPartArticle[];
  exitPartServices: ExitPartService[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ExitPartService {
  id: number;
  code: string;
  name: string;
  duration: number;
  durationType: string;
  received: number;
  inspection?: InspectionStatus;
  observation?: string;
  service: Service;
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
  inspection: InspectionStatus;
  observation?: string;
  article: Article;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateExitPartDto {
  observation?: string;
  exitDate: string;
  employeeId?: number;
  warehouseId: number;
  purchaseOrderId?: number;
  exitPartArticles: CreateExitPartArticleDto[];
  exitPartServices?: CreateExitPartServiceDto[];
}

export interface UpdateExitPartDto {
  observation?: string;
  exitDate?: string;
  employeeId?: number;
  exitPartArticles?: UpdateExitPartArticleDto[];
  exitPartServices?: UpdateExitPartServiceDto[];
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
  inspection?: InspectionStatus;
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
  inspection?: InspectionStatus;
  observation?: string;
  articleId: number;
}

export interface CreateExitPartServiceDto {
  code: string;
  name: string;
  duration: number;
  durationType: string;
  received: number;
  inspection?: InspectionStatus;
  observation?: string;
  serviceId: number;
}

export interface UpdateExitPartServiceDto {
  id: number;
  code: string;
  name: string;
  duration: number;
  received: number;
  inspection?: InspectionStatus;
  observation?: string;
  serviceId: number;
}
