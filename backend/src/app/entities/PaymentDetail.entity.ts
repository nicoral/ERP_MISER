import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentGroup } from './PaymentGroup.entity';
import { Employee } from './Employee.entity';
import { Supplier } from './Supplier.entity';

export enum PaymentDetailStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PhysicalReceipt {
  YES = 'YES',
  NO = 'NO',
}

@Entity()
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Código único del pago (ej: "PAY-2024-001-01", "PAY-2024-001-02")

  @Column({
    type: 'enum',
    enum: PaymentDetailStatus,
    default: PaymentDetailStatus.PENDING,
  })
  status: PaymentDetailStatus;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  amount: number; // Monto de este pago específico

  @Column('text', { nullable: true })
  paymentReceipt: string; // Comprobante de pago

  @Column({ type: 'date', nullable: true })
  depositDate: Date; // Fecha de depósito

  @Column('varchar', { length: 100, nullable: true })
  movementNumber: string; // Número de movimiento

  @Column('text', { nullable: true })
  receiptImage: string; // Foto del comprobante

  @Column('text', { nullable: true })
  invoiceImage: string; // Foto de la factura

  @Column({
    type: 'enum',
    enum: PhysicalReceipt,
    nullable: true,
  })
  physicalReceipt: PhysicalReceipt; // Comprobante físico (SI o NO)

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date; // Fecha de compra

  @Column({ type: 'date', nullable: true })
  invoiceEmissionDate: Date; // Fecha de emisión de factura

  @Column('varchar', { length: 100, nullable: true })
  documentNumber: string; // Número de documento (número de la factura)

  @Column('text', { nullable: true })
  description: string; // Descripción del pago

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  retentionAmount: number; // Monto de retención (si supera los S/700)

  @Column('decimal', { precision: 5, scale: 2, default: 3.0 })
  retentionPercentage: number; // Porcentaje de retención (3% para bienes)

  @Column('boolean', { default: false })
  hasRetention: boolean; // Indica si aplica retención

  // Relación con el grupo de pagos
  @ManyToOne(() => PaymentGroup, paymentGroup => paymentGroup.paymentDetails)
  @JoinColumn({ name: 'payment_group_id' })
  paymentGroup: PaymentGroup;

  // Relación con el proveedor
  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  // Relación con el empleado que creó el pago
  @ManyToOne(() => Employee, employee => employee.paymentDetails)
  @JoinColumn({ name: 'created_by' })
  createdBy: Employee;

  // Relación con el empleado que aprobó/rechazó el pago
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: Employee;

  @Column('text', { nullable: true })
  rejectionReason: string; // Motivo de rechazo

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date;
}
