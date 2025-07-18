import type { CostCenter } from './costCenter';
import type { Employee } from './employee';
import type { Article } from './article';
import type { Service } from './service';
import type { Warehouse } from './warehouse';

export interface Requirement {
  id: number;
  code: string;
  priority: string;
  observation: string;
  status: string;
  type: 'ARTICLE' | 'SERVICE';
  costCenter: CostCenter;
  costCenterSecondary: CostCenter;
  warehouse: Warehouse;
  employee: Employee;
  requirementArticles: RequirementArticle[];
  requirementServices: RequirementService[];
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
  inform?: string;
}

export interface RequirementArticle {
  id: number;
  article: Article;
  quantity: number;
  unitPrice: number;
  justification: string;
  currency: 'PEN' | 'USD';
}

export interface RequirementService {
  id: number;
  service: Service;
  unitPrice: number;
  justification: string;
  currency: 'PEN' | 'USD';
  durationType?: 'HORA' | 'CONTRATO' | 'DIA' | 'JORNADA';
  duration?: number;
}

export interface CreateRequirementDto {
  priority: string;
  observation: string;
  costCenterId: string;
  costCenterSecondaryId: string;
  warehouseId: string;
  type?: 'ARTICLE' | 'SERVICE';
  requirementArticles?: CreateRequirementArticleDto[];
  requirementServices?: CreateRequirementServiceDto[];
}

export interface CreateRequirementArticleDto {
  articleId: string;
  quantity: number;
  unitPrice: number;
  justification: string;
  currency: string;
}

export interface CreateRequirementServiceDto {
  serviceId: string;
  unitPrice: number;
  justification: string;
  currency: string;
  durationType?: 'HORA' | 'CONTRATO' | 'DIA' | 'JORNADA';
  duration?: number;
}
