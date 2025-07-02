import type { CostCenter } from './costCenter';
import type { Employee } from './employee';
import type { Article } from './article';
import type { Warehouse } from './warehouse';

export interface Requirement {
  id: number;
  code: string;
  priority: string;
  observation: string;
  status: string;
  costCenter: CostCenter;
  costCenterSecondary: CostCenter;
  warehouse: Warehouse;
  employee: Employee;
  requirementArticles: RequirementArticle[];
  createdAt: string;
  updatedAt: Date;
  deletedAt: Date | null;
  firstSignature?: string;
  firstSignedBy?: number;
  firstSignedAt?: string;
  secondSignature?: string;
  secondSignedBy?: number;
  secondSignedAt?: string;
  thirdSignature?: string;
  thirdSignedBy?: number;
  thirdSignedAt?: string;
  fourthSignature?: string;
  fourthSignedBy?: number;
  fourthSignedAt?: string;
  rejectedReason?: string;
  rejectedBy?: number;
  rejectedAt?: string;
}

export interface RequirementArticle {
  id: number;
  article: Article;
  quantity: number;
  unitPrice: number;
  justification: string;
  currency: 'PEN' | 'USD';
}

export interface CreateRequirementDto {
  priority: string;
  observation: string;
  costCenterId: string;
  requirementArticles: CreateRequirementArticleDto[];
}

export interface CreateRequirementArticleDto {
  articleId: string;
  quantity: number;
  unitPrice: number;
  justification: string;
  currency: string;
}
