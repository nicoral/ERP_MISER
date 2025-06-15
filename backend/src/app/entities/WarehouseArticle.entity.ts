import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Warehouse } from './Warehouse.entity';
import { Article } from './Article.entity';

@Entity()
export class WarehouseArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.warehouseArticles)
  warehouse: Warehouse;

  @ManyToOne(() => Article, (article) => article.warehouseArticles)
  article: Article;

  @Column('int', { name: 'stock', nullable: false, default: 0 })
  stock: number;
}
