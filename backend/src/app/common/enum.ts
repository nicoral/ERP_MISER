export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  BLACK_LIST = 'BLACK_LIST',
  INACTIVE = 'INACTIVE',
}

/**
 * Estados del flujo de aprobación de requerimientos
 *
 * Flujo de firmas:
 * 1. PENDING -> SIGNED_1 (Solicitante)
 * 2. SIGNED_1 -> SIGNED_2 (Oficina Técnica)
 * 3. SIGNED_2 -> SIGNED_3 (Administración)
 * 4. SIGNED_3 -> APPROVED (Gerencia, solo para montos >= S/. 10,000)
 *
 * Para montos < S/. 10,000: SIGNED_2 -> APPROVED (aprobación automática)
 */
export enum RequirementStatus {
  PENDING = 'PENDING',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

export enum RequirementPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Currency {
  PEN = 'PEN',
  USD = 'USD',
}

export enum EntryPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum ExitPartStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  OBSERVED = 'OBSERVED',
}

export enum EntryPartType {
  ARTICLE = 'ARTICLE',
  SERVICE = 'SERVICE',
}

export enum ExitPartType {
  ARTICLE = 'ARTICLE',
  SERVICE = 'SERVICE',
}

// Fuel Control Enums
export enum FuelDailyControlStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export enum FuelOutputStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  CANCELLED = 'CANCELLED',
}

export enum FuelMovementType {
  OPENING = 'OPENING',
  OUTPUT = 'OUTPUT',
  ADJUSTMENT = 'ADJUSTMENT',
  CLOSING = 'CLOSING',
}
