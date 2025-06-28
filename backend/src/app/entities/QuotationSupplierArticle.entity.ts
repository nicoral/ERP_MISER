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
import { QuotationSupplier } from './QuotationSupplier.entity';
import { RequirementArticle } from './RequirementArticle.entity';

@Entity()
export class QuotationSupplierArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.quotationSupplierArticles
  )
  @JoinColumn({ name: 'quotation_supplier_id' })
  quotationSupplier: QuotationSupplier;

  @ManyToOne(
    () => RequirementArticle,
    requirementArticle => requirementArticle.quotationSupplierArticles
  )
  @JoinColumn({ name: 'requirement_article_id' })
  requirementArticle: RequirementArticle;

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
