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

export interface ProgressCalculationOptions {
  maxProgress?: number;
  approvalSteps?: number;
  baseProgress?: number;
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

/**
 * Verifica si un usuario puede firmar según el estado actual
 */
export function canUserSign(
  entity: ApprovalFlowEntity,
  userPermissions: string[],
  creatorId: number,
  userId: number,
  entityType: 'requirement' | 'quotation' | 'fuelControl' = 'requirement'
): { canSign: boolean; requiredPermission: string } {
  let canSign = false;
  let requiredPermission = '';

  // Determinar el estado actual basado en las firmas
  let currentStatus: string;

  if (!entity.firstSignedAt) {
    currentStatus = 'PENDING';
  } else if (!entity.secondSignedAt) {
    currentStatus = 'SIGNED_1';
  } else if (!entity.thirdSignedAt) {
    currentStatus = 'SIGNED_2';
  } else if (!entity.fourthSignedAt) {
    currentStatus = 'SIGNED_3';
  } else {
    currentStatus = 'APPROVED';
  }

  // Mapear permisos según el tipo de entidad
  const permissionPrefix =
    entityType === 'requirement' ? 'requirement' : 
    entityType === 'quotation' ? 'quotation' : 'fuelControl';

  switch (currentStatus) {
    case 'PENDING':
      canSign = userId === creatorId;
      break;
    case 'SIGNED_1':
      requiredPermission = `${permissionPrefix}-view-signed1`;
      canSign =
        userPermissions.includes(requiredPermission) && !entity.secondSignedAt;
      break;
    case 'SIGNED_2':
      requiredPermission = `${permissionPrefix}-view-signed2`;
      canSign =
        userPermissions.includes(requiredPermission) && !entity.thirdSignedAt;
      break;
    case 'SIGNED_3':
      requiredPermission = `${permissionPrefix}-view-signed3`;
      canSign =
        userPermissions.includes(requiredPermission) && !entity.fourthSignedAt;
      break;
    default:
      return { canSign: false, requiredPermission: '' };
  }

  return { canSign, requiredPermission };
}

/**
 * Procesa la firma de un usuario
 */
export function processSignature(
  entity: ApprovalFlowEntity,
  userId: number,
  signature: string,
  isLowAmount: boolean = false
): {
  updatedEntity: ApprovalFlowEntity;
  becameApproved: boolean;
  newStatus: string;
} {
  const updatedEntity = { ...entity };
  let becameApproved = false;
  let newStatus = entity.status || 'PENDING';

  // Determinar el estado actual basado en las firmas
  let currentStatus: string;

  if (!entity.firstSignedAt) {
    currentStatus = 'PENDING';
  } else if (!entity.secondSignedAt) {
    currentStatus = 'SIGNED_1';
  } else if (!entity.thirdSignedAt) {
    currentStatus = 'SIGNED_2';
  } else if (!entity.fourthSignedAt) {
    currentStatus = 'SIGNED_3';
  } else {
    currentStatus = 'APPROVED';
  }

  switch (currentStatus) {
    case 'PENDING':
      updatedEntity.firstSignature = signature;
      updatedEntity.firstSignedBy = userId;
      updatedEntity.firstSignedAt = new Date();
      newStatus = 'SIGNED_1';
      break;
    case 'SIGNED_1':
      updatedEntity.secondSignature = signature;
      updatedEntity.secondSignedBy = userId;
      updatedEntity.secondSignedAt = new Date();
      newStatus = 'SIGNED_2';
      break;
    case 'SIGNED_2':
      updatedEntity.thirdSignature = signature;
      updatedEntity.thirdSignedBy = userId;
      updatedEntity.thirdSignedAt = new Date();
      if (isLowAmount) {
        newStatus = 'APPROVED';
        becameApproved = true;
      } else {
        newStatus = 'SIGNED_3';
      }
      break;
    case 'SIGNED_3':
      updatedEntity.fourthSignature = signature;
      updatedEntity.fourthSignedBy = userId;
      updatedEntity.fourthSignedAt = new Date();
      newStatus = 'APPROVED';
      becameApproved = true;
      break;
    default:
      throw new Error('No se puede firmar en este estado');
  }

  updatedEntity.status = newStatus;

  return { updatedEntity, becameApproved, newStatus };
}

/**
 * Verifica si una entidad es de monto bajo (para aprobación automática)
 */
export function isLowAmount(
  amount: number,
  threshold: number = 10000
): boolean {
  return amount < threshold;
}

/**
 * Obtiene el texto del botón de firma según el estado
 */
export function getSignButtonText(entity: ApprovalFlowEntity): string {
  if (!entity.firstSignedAt) {
    return 'Firmar (Solicitante)';
  } else if (!entity.secondSignedAt) {
    return 'Firmar (Oficina Técnica)';
  } else if (!entity.thirdSignedAt) {
    return 'Firmar (Administración)';
  } else if (!entity.fourthSignedAt) {
    return 'Firmar (Gerencia)';
  } else {
    return 'Aprobado';
  }
}

/**
 * Obtiene el estado de aprobación en texto legible
 */
export function getApprovalStatus(entity: ApprovalFlowEntity): string {
  if (entity.rejectedAt) {
    return 'Rechazado';
  } else if (entity.fourthSignedAt) {
    return 'Aprobado';
  } else if (entity.thirdSignedAt) {
    return 'Firmado por Administración';
  } else if (entity.secondSignedAt) {
    return 'Firmado por Oficina Técnica';
  } else if (entity.firstSignedAt) {
    return 'Firmado por Solicitante';
  } else {
    return 'Pendiente';
  }
}
