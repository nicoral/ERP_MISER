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
import { QuotationRequest } from './QuotationRequest.entity';
import { Supplier } from './Supplier.entity';
import { QuotationSupplierArticle } from './QuotationSupplierArticle.entity';
import { QuotationSupplierService } from './QuotationSupplierService.entity';
import { SupplierQuotation } from './SupplierQuotation.entity';

export enum QuotationSupplierStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  SAVED = 'SAVED',
  RESPONDED = 'RESPONDED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class QuotationSupplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QuotationSupplierStatus,
    default: QuotationSupplierStatus.PENDING,
  })
  status: QuotationSupplierStatus;

  @Column({ nullable: true })
  orderNumber: string;

  @Column('text', { nullable: true })
  terms: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @ManyToOne(
    () => QuotationRequest,
    quotationRequest => quotationRequest.quotationSuppliers
  )
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @ManyToOne(() => Supplier, supplier => supplier.quotationSuppliers)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(
    () => QuotationSupplierArticle,
    quotationSupplierArticle => quotationSupplierArticle.quotationSupplier
  )
  quotationSupplierArticles: QuotationSupplierArticle[];

  @OneToMany(
    () => QuotationSupplierService,
    quotationSupplierService => quotationSupplierService.quotationSupplier
  )
  quotationSupplierServices: QuotationSupplierService[];

  @OneToOne(
    () => SupplierQuotation,
    supplierQuotation => supplierQuotation.quotationSupplier
  )
  supplierQuotation: SupplierQuotation;

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
