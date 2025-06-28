import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SupplierQuotation } from './SupplierQuotation.entity';
import { RequirementArticle } from './RequirementArticle.entity';
import { FinalSelectionItem } from './FinalSelectionItem.entity';

export enum QuotationItemStatus {
  QUOTED = 'QUOTED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NOT_QUOTED = 'NOT_QUOTED',
}

@Entity()
export class SupplierQuotationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QuotationItemStatus,
    default: QuotationItemStatus.NOT_QUOTED,
  })
  status: QuotationItemStatus;

  @Column({ nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalPrice: number;

  @Column({ default: 'PEN' })
  currency: string;

  @Column({ nullable: true })
  deliveryTime: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  reasonNotAvailable: string;

  @ManyToOne(
    () => SupplierQuotation,
    supplierQuotation => supplierQuotation.supplierQuotationItems
  )
  @JoinColumn({ name: 'supplier_quotation_id' })
  supplierQuotation: SupplierQuotation;

  @ManyToOne(
    () => RequirementArticle,
    requirementArticle => requirementArticle.supplierQuotationItems
  )
  @JoinColumn({ name: 'requirement_article_id' })
  requirementArticle: RequirementArticle;

  @OneToMany(
    () => FinalSelectionItem,
    finalSelectionItem => finalSelectionItem.supplierQuotationItem
  )
  finalSelectionItems: FinalSelectionItem[];

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
