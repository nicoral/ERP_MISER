import { BadRequestException } from '@nestjs/common';

export interface ApprovalFlowEntity {
  firstSignature?: string | null;
  firstSignedBy?: number | null;
  firstSignedAt?: Date | null;
  secondSignature?: string | null;
  secondSignedBy?: number | null;
  secondSignedAt?: Date | null;
  thirdSignature?: string | null;
  thirdSignedBy?: number | null;
  thirdSignedAt?: Date | null;
  fourthSignature?: string | null;
  fourthSignedBy?: number | null;
  fourthSignedAt?: Date | null;
  rejectedReason?: string | null;
  rejectedBy?: number | null;
  rejectedAt?: Date | null;
  status?: string;
}

export interface DocumentApprovalConfiguration {
  id: number;
  entityType: string;
  entityId: number;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface ProgressCalculationOptions {
  maxProgress?: number;
  approvalSteps?: number;
  baseProgress?: number;
}

/**
 * Obtiene la firma por nivel
 */
export function getSignatureByLevel(
  entity: ApprovalFlowEntity,
  level: number
): boolean {
  switch (level) {
    case 1:
      return !!entity.firstSignedAt;
    case 2:
      return !!entity.secondSignedAt;
    case 3:
      return !!entity.thirdSignedAt;
    case 4:
      return !!entity.fourthSignedAt;
    default:
      return false;
  }
}

/**
 * Verifica si un usuario puede firmar usando configuración específica
 */
export async function canUserSignWithConfiguration(
  entity: ApprovalFlowEntity,
  userPermissions: string[],
  creatorId: number,
  userId: number,
  configurations: DocumentApprovalConfiguration[],
  totalAmount: number,
  lowAmountThreshold: number,
  entityType: string = 'requirement'
): Promise<{ canSign: boolean; level: number; reason?: string }> {
  const isCreator = userId === creatorId;

  for (const config of configurations) {
    if (!config.isRequired) continue;

    // ✅ Validación 1: Solo creador puede firmar como solicitante
    if (config.roleName === 'SOLICITANTE') {
      if (!isCreator) {
        continue; // No puede firmar como solicitante
      }
      if (entity.firstSignedAt) {
        continue; // Ya fue firmado por solicitante
      }
      return { canSign: true, level: config.signatureLevel };
    }

    // ✅ Validación 2: Gerencia solo para montos altos
    if (config.roleName === 'GERENCIA') {
      if (totalAmount < lowAmountThreshold) {
        continue; // Gerencia no requerida para montos bajos
      }
    }

    // ✅ Validación 3: Verificar permisos y si ya fue firmado
    const hasPermission = userPermissions.includes(
      `${entityType}-signed-${config.roleName.toLowerCase()}`
    );
    const alreadySigned = getSignatureByLevel(entity, config.signatureLevel);

    if (hasPermission && !alreadySigned) {
      return {
        canSign: true,
        level: config.signatureLevel,
      };
    }
  }

  return {
    canSign: false,
    level: 0,
    reason: 'No tienes permisos para firmar en ningún nivel disponible',
  };
}

/**
 * Procesa la firma según la configuración dinámica
 */
export async function processSignatureWithConfiguration(
  entity: ApprovalFlowEntity,
  userId: number,
  signature: string,
  level: number,
  configurations: Array<{
    signatureLevel: number;
    roleName: string;
    isRequired: boolean;
  }>
): Promise<{
  updatedEntity: ApprovalFlowEntity;
  becameApproved: boolean;
  newStatus: string;
}> {
  const updatedEntity = { ...entity };
  let becameApproved = false;
  let newStatus = entity.status || 'PENDING';

  // Aplicar firma según el nivel
  switch (level) {
    case 1:
      updatedEntity.firstSignature = signature;
      updatedEntity.firstSignedBy = userId;
      updatedEntity.firstSignedAt = new Date();
      newStatus = 'SIGNED_1';
      break;
    case 2:
      updatedEntity.secondSignature = signature;
      updatedEntity.secondSignedBy = userId;
      updatedEntity.secondSignedAt = new Date();
      newStatus = 'SIGNED_2';
      break;
    case 3:
      updatedEntity.thirdSignature = signature;
      updatedEntity.thirdSignedBy = userId;
      updatedEntity.thirdSignedAt = new Date();
      newStatus = 'SIGNED_3';
      break;
    case 4:
      updatedEntity.fourthSignature = signature;
      updatedEntity.fourthSignedBy = userId;
      updatedEntity.fourthSignedAt = new Date();
      newStatus = 'SIGNED_4';
      break;
    default:
      throw new Error('Nivel de firma no válido');
  }

  // Verificar si todas las firmas requeridas están completadas
  const allRequiredSignaturesCompleted = checkAllRequiredSignaturesCompleted(
    updatedEntity,
    configurations
  );

  if (allRequiredSignaturesCompleted) {
    newStatus = 'APPROVED';
    becameApproved = true;
  }

  updatedEntity.status = newStatus;
  return { updatedEntity, becameApproved, newStatus };
}

/**
 * Verifica si todas las firmas requeridas están completadas
 */
function checkAllRequiredSignaturesCompleted(
  entity: ApprovalFlowEntity,
  configurations: Array<{
    signatureLevel: number;
    roleName: string;
    isRequired: boolean;
  }>
): boolean {
  // Filtrar solo las configuraciones requeridas
  const requiredConfigurations = configurations.filter(
    config => config.isRequired
  );

  // Verificar que cada firma requerida esté completada
  for (const config of requiredConfigurations) {
    const isSignatureCompleted = checkSignatureLevelCompleted(
      entity,
      config.signatureLevel
    );
    if (!isSignatureCompleted) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica si una firma específica está completada
 */
function checkSignatureLevelCompleted(
  entity: ApprovalFlowEntity,
  level: number
): boolean {
  switch (level) {
    case 1:
      return !!entity.firstSignedAt;
    case 2:
      return !!entity.secondSignedAt;
    case 3:
      return !!entity.thirdSignedAt;
    case 4:
      return !!entity.fourthSignedAt;
    default:
      return false;
  }
}

/**
 * Genera un mensaje de error detallado para problemas de firma
 */
export function generateSignatureErrorMessage(
  entityType: 'requirement' | 'quotation' | 'fuelControl' | 'purchase_order',
  errorDetails: {
    reason: string;
    currentStatus: string;
    requiredPermission: string;
    userHasPermission: boolean;
    isCreator: boolean;
  }
): string {
  const entityName = {
    requirement: 'requerimiento',
    quotation: 'cotización',
    fuelControl: 'control de combustible',
    purchase_order: 'orden de compra',
  }[entityType];

  const statusText =
    {
      PENDING: 'Pendiente',
      SIGNED_1: 'Firmado por Solicitante',
      SIGNED_2: 'Firmado por Oficina Técnica',
      SIGNED_3: 'Firmado por Administración',
      APPROVED: 'Aprobado',
    }[errorDetails.currentStatus] || errorDetails.currentStatus;

  return `No puedes firmar este ${entityName}. ${errorDetails.reason}. Estado actual: ${statusText}. Permiso requerido: ${errorDetails.requiredPermission}`;
}

/**
 * Valida que una entidad sea elegible para firma según las reglas de negocio
 */
export function validateSignatureEligibility(
  entity: ApprovalFlowEntity,
  userId: number,
  entityType:
    | 'requirement'
    | 'quotation'
    | 'fuelControl'
    | 'purchase_order' = 'requirement',
  totalAmount?: number,
  entitySubType?: 'ARTICLE' | 'SERVICE',
  hasInform?: boolean
): void {
  // 1. Validación de estados inválidos
  if (entity.rejectedAt) {
    throw new BadRequestException('No se puede firmar un documento rechazado');
  }

  // 2. Validación de montos válidos (solo mínimo, no máximo)
  if (totalAmount !== undefined && totalAmount <= 0) {
    throw new BadRequestException('El monto total debe ser mayor a cero');
  }

  // 3. Validación de informe para servicios
  if (
    entityType === 'requirement' &&
    entitySubType === 'SERVICE' &&
    hasInform === false
  ) {
    throw new BadRequestException(
      'Los requerimientos de servicio requieren un informe antes de ser firmados'
    );
  }

  // 4. Validación de que el documento no esté ya aprobado
  if (entity.fourthSignedAt || entity.status === 'APPROVED') {
    throw new BadRequestException('El documento ya está aprobado');
  }
}

/**
 * Calcula el progreso de aprobación basado en las firmas
 */
export function calculateApprovalProgress(
  entity: ApprovalFlowEntity,
  options: ProgressCalculationOptions = {}
): number {
  const { maxProgress = 100, approvalSteps = 4, baseProgress = 80 } = options;

  // Contar firmas completadas
  const completedSignatures = [
    entity.firstSignedAt,
    entity.secondSignedAt,
    entity.thirdSignedAt,
    entity.fourthSignedAt,
  ].filter(Boolean).length;

  // Si no hay firmas, el progreso es el baseProgress (80%)
  if (completedSignatures === 0) {
    return baseProgress;
  }

  // Si todas las firmas están completas, el progreso es 100%
  if (completedSignatures >= approvalSteps) {
    return maxProgress;
  }

  // Calcular progreso basado en firmas completadas
  const approvalProgress =
    (completedSignatures / approvalSteps) * (maxProgress - baseProgress);
  return Math.round(baseProgress + approvalProgress);
}
