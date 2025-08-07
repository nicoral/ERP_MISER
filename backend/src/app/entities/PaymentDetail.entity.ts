import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee.entity';
import { PaymentGroup } from './PaymentGroup.entity';
import { PaymentInvoice } from './PaymentInvoice.entity';

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
  retentionDocument: string; // Documento de retención (imagen/PDF)

  @Column({
    type: 'enum',
    enum: PhysicalReceipt,
    nullable: true,
  })
  physicalReceipt: PhysicalReceipt; // Comprobante físico (SI o NO)

  @Column('text', { nullable: true })
  description: string; // Descripción del pago

  // Relación con la orden de compra
  @ManyToOne(() => PaymentGroup, paymentGroup => paymentGroup.paymentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_group_id' })
  paymentGroup: PaymentGroup;

  // Relación con el empleado que creó el pago
  @ManyToOne(() => Employee, employee => employee.paymentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: Employee;

  // Relación con el empleado que aprobó/rechazó el pago
  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: Employee;

  @Column('text', { nullable: true })
  rejectionReason: string; // Motivo de rechazo

  // Relación con las facturas (1:N)
  @OneToMany(() => PaymentInvoice, invoice => invoice.paymentDetail, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  invoices: PaymentInvoice[];

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
