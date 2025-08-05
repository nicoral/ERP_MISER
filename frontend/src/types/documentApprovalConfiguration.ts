export interface DocumentApprovalConfiguration {
  id: number;
  entityType: string;
  entityId: number;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  isActive: boolean;
  updatedBy?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalFlowTemplate {
  id: number;
  templateName: string;
  entityType: string;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface SignatureConfigurationDto {
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
}

export interface CreateDocumentApprovalConfigurationDto {
  entityType: string;
  entityId: number;
  configurations: SignatureConfigurationDto[];
}

export interface ApplyTemplateDto {
  templateName: string;
  entityId: number;
}

export interface DocumentApprovalConfigurationResponse {
  message: string;
}

export interface TemplateResponse {
  message: string;
}

// Roles disponibles para firmas
export const SIGNATURE_ROLES = [
  'SOLICITANTE',
  'OFICINA_TECNICA',
  'ADMINISTRACION',
  'GERENCIA',
] as const;

export type SignatureRole = (typeof SIGNATURE_ROLES)[number];

// Niveles de firma
export const SIGNATURE_LEVELS = [1, 2, 3, 4] as const;

export type SignatureLevel = (typeof SIGNATURE_LEVELS)[number];

// Tipos de entidades
export const ENTITY_TYPES = [
  'requirement',
  'quotation',
  'fuel_control',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface SignatureConfigurationResponse {
  requirement: {
    id: number;
    code: string;
    totalAmount: number;
    lowAmountThreshold: number;
    isLowAmount: boolean;
  };
  configurations: Array<{
    id: number;
    signatureLevel: number;
    roleName: string;
    isRequired: boolean;
  }>;
}
