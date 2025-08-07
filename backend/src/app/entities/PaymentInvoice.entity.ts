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
import { PaymentDetail } from './PaymentDetail.entity';

@Entity()
export class PaymentInvoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Código único de la factura (ej: "INV-2024-001-01-01")

  @Column('text', { nullable: true })
  invoiceImage: string; // Foto de la factura

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date; // Fecha de compra

  @Column({ type: 'date', nullable: true })
  invoiceEmissionDate: Date; // Fecha de emisión de factura

  @Column('varchar', { length: 100, nullable: true })
  documentNumber: string; // Número de documento (número de la factura)

  @Column('text', { nullable: true })
  description: string; // Descripción de la factura

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  amount: number; // Monto de esta factura específica

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  retentionAmount: number; // Monto de retención para esta factura

  @Column('decimal', { precision: 5, scale: 2, default: 3.0 })
  retentionPercentage: number; // Porcentaje de retención

  @Column('boolean', { default: false })
  hasRetention: boolean; // Indica si aplica retención para esta factura

  // Relación con el PaymentDetail
  @ManyToOne(() => PaymentDetail, paymentDetail => paymentDetail.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_detail_id' })
  paymentDetail: PaymentDetail;

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