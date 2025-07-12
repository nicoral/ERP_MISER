import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { QuotationSupplier } from './QuotationSupplier.entity';
import { SupplierQuotationItem } from './SupplierQuotationItem.entity';
import { SupplierQuotationServiceItem } from './SupplierQuotationServiceItem.entity';

export enum SupplierQuotationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class SupplierQuotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  quotationNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  receivedAt: Date;

  @Column({ type: 'date' })
  validUntil: Date;

  @Column({ default: 'PEN' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column('text', { nullable: true })
  methodOfPayment: string;

  @Column('text', { nullable: true })
  igv: string;

  @Column({
    type: 'enum',
    enum: SupplierQuotationStatus,
    default: SupplierQuotationStatus.DRAFT,
  })
  status: SupplierQuotationStatus;

  @Column('text', { nullable: true })
  notes: string;

  @OneToOne(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.supplierQuotation
  )
  @JoinColumn({ name: 'quotation_supplier_id' })
  quotationSupplier: QuotationSupplier;

  @OneToMany(
    () => SupplierQuotationItem,
    supplierQuotationItem => supplierQuotationItem.supplierQuotation
  )
  supplierQuotationItems: SupplierQuotationItem[];

  @OneToMany(
    () => SupplierQuotationServiceItem,
    supplierQuotationServiceItem =>
      supplierQuotationServiceItem.supplierQuotation
  )
  supplierQuotationServiceItems: SupplierQuotationServiceItem[];

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
