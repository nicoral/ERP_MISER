import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee.entity';
import { PaymentDetail } from './PaymentDetail.entity';
import { PurchaseOrder } from './PurchaseOrder.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class PaymentGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Código único del grupo de pagos (ej: "PAY-2024-001")

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalAmount: number; // Monto total de la cotización a pagar

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paidAmount: number; // Monto total pagado hasta el momento

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  pendingAmount: number; // Monto pendiente por pagar

  @Column('text', { nullable: true })
  description: string; // Descripción del grupo de pagos

  @Column('text', { nullable: true })
  notes: string; // Notas adicionales

  // Relación con la cotización (1:1)
  @OneToOne(() => PurchaseOrder, purchaseOrder => purchaseOrder.paymentGroup)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  // Relación con el empleado que aprobó el grupo de pagos
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: Employee;

  // Relación con los pagos individuales
  @OneToMany(() => PaymentDetail, paymentDetail => paymentDetail.paymentGroup)
  paymentDetails: PaymentDetail[];

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
