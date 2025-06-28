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
import { FinalSelection } from './FinalSelection.entity';
import { RequirementArticle } from './RequirementArticle.entity';
import { Supplier } from './Supplier.entity';
import { SupplierQuotationItem } from './SupplierQuotationItem.entity';

@Entity()
export class FinalSelectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ default: 'PEN' })
  currency: string;

  @Column({ nullable: true })
  deliveryTime: number;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(
    () => FinalSelection,
    finalSelection => finalSelection.finalSelectionItems
  )
  @JoinColumn({ name: 'final_selection_id' })
  finalSelection: FinalSelection;

  @ManyToOne(
    () => RequirementArticle,
    requirementArticle => requirementArticle.finalSelectionItems
  )
  @JoinColumn({ name: 'requirement_article_id' })
  requirementArticle: RequirementArticle;

  @ManyToOne(() => Supplier, supplier => supplier.finalSelectionItems)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(
    () => SupplierQuotationItem,
    supplierQuotationItem => supplierQuotationItem.finalSelectionItems
  )
  @JoinColumn({ name: 'supplier_quotation_item_id' })
  supplierQuotationItem: SupplierQuotationItem;

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
