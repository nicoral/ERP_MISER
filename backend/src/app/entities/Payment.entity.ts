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
import { QuotationRequest } from './QuotationRequest.entity';
import { Employee } from './Employee.entity';

export enum PaymentStatus {
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
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column('text', { nullable: true })
  paymentReceipt: string; // Comprobante de pago

  @Column({ type: 'date', nullable: true })
  depositDate: Date; // Fecha de depósito

  @Column('varchar', { length: 100, nullable: true })
  movementNumber: string; // Número de movimiento

  @Column('text', { nullable: true })
  receiptImage: string; // Foto del comprobante

  @Column({
    type: 'enum',
    enum: PhysicalReceipt,
    nullable: true,
  })
  physicalReceipt: PhysicalReceipt; // Comprobante físico (SI o NO)

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date; // Fecha de compra (se jala automáticamente del día que se aprobó)

  @Column({ type: 'date', nullable: true })
  invoiceEmissionDate: Date; // Fecha de emisión de factura

  @Column('varchar', { length: 100, nullable: true })
  documentNumber: string; // Número de documento (número de la factura)

  @Column('text', { nullable: true })
  description: string; // Descripción

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amount: number; // Monto del pago

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  retentionAmount: number; // Monto de retención (si supera los S/700)

  @Column('decimal', { precision: 5, scale: 2, default: 3.0 })
  retentionPercentage: number; // Porcentaje de retención (3% para bienes)

  @Column('boolean', { default: false })
  hasRetention: boolean; // Indica si aplica retención

  // Relación con la cotización
  @ManyToOne(() => QuotationRequest, quotationRequest => quotationRequest.payments)
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  // Relación con el empleado que creó el pago
  @ManyToOne(() => Employee, employee => employee.payments)
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