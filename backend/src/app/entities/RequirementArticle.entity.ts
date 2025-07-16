import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Article } from './Article.entity';
import { Requirement } from './Requirement.entity';
import { Currency } from '../common/enum';
import { SupplierQuotationItem } from './SupplierQuotationItem.entity';
import { QuotationSupplierArticle } from './QuotationSupplierArticle.entity';
import { FinalSelectionItem } from './FinalSelectionItem.entity';

@Entity()
export class RequirementArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Requirement,
    requirement => requirement.requirementArticles,
    { onDelete: 'CASCADE' }
  )
  requirement: Requirement;

  @ManyToOne(() => Article, article => article.requirementArticles, {
    onDelete: 'CASCADE',
  })
  article: Article;

  @Column('numeric', { name: 'quantity', nullable: false })
  quantity: number;

  @Column('decimal', {
    name: 'unit_price',
    nullable: false,
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Column('text', { name: 'justification', nullable: true })
  justification: string;

  @Column('varchar', { length: 5, name: 'currency', default: 'PEN' })
  currency: Currency;

  @OneToMany(
    () => SupplierQuotationItem,
    supplierQuotationItem => supplierQuotationItem.requirementArticle,
    { cascade: true, onDelete: 'CASCADE' }
  )
  supplierQuotationItems: SupplierQuotationItem[];

  @OneToMany(
    () => QuotationSupplierArticle,
    quotationSupplierArticle => quotationSupplierArticle.requirementArticle,
    { cascade: true, onDelete: 'CASCADE' }
  )
  quotationSupplierArticles: QuotationSupplierArticle[];

  @OneToMany(
    () => FinalSelectionItem,
    finalSelectionItem => finalSelectionItem.requirementArticle,
    { cascade: true, onDelete: 'CASCADE' }
  )
  finalSelectionItems: FinalSelectionItem[];
}
