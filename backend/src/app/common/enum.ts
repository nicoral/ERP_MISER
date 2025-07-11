export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  BLACK_LIST = 'BLACK_LIST',
  INACTIVE = 'INACTIVE',
}

export enum RequirementStatus {
  PENDING = 'PENDING',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  SIGNED_4 = 'SIGNED_4',
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

export enum InspectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
