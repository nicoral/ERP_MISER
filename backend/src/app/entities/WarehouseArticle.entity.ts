import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Warehouse } from './Warehouse.entity';
import { Article } from './Article.entity';

@Entity()
export class WarehouseArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, warehouse => warehouse.warehouseArticles)
  warehouse: Warehouse;

  @ManyToOne(() => Article, article => article.warehouseArticles)
  article: Article;

  @Column('int', { name: 'stock', nullable: false, default: 0 })
  stock: number;

  @Column('int', { name: 'min_stock', nullable: false, default: 0 })
  minStock: number;

  @Column('int', { name: 'max_stock', nullable: false, default: 100 })
  maxStock: number;

  @Column('varchar', {
    length: 100,
    name: 'line',
    nullable: false,
    default: 'Sin línea',
  })
  line: string;

  @Column('varchar', {
    length: 100,
    name: 'shelf',
    nullable: false,
    default: 'Sin estante',
  })
  shelf: string;

  @Column('decimal', { name: 'valued', nullable: false, default: 0 })
  valued: number;
}
