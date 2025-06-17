import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Article } from './Article.entity';
import { Requirement } from './Requirement.entity';

@Entity()
export class RequirementArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Requirement, (requirement) => requirement.requirementArticles)
  requirement: Requirement;

  @ManyToOne(() => Article, (article) => article.requirementArticles)
  article: Article;

  @Column('numeric', { name: 'quantity', nullable: false })
  quantity: number;

  @Column('decimal', { name: 'unit_price', nullable: false, precision: 10, scale: 2 })
  unitPrice: number;

  @Column('text', { name: 'justification', nullable: true })
  justification: string;
}