import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WarehouseArticle } from './WarehouseArticle.entity';
import { Brand } from './Brand.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, name: 'name', nullable: false })
  name: string;

  @Column('varchar', { length: 100, name: 'unit_of_measure', nullable: false })
  unitOfMeasure: string;

  @Column('varchar', { length: 100, name: 'code', nullable: false })
  code: string;

  @Column('varchar', { length: 100, name: 'line', nullable: false })
  line: string;

  @Column('varchar', { length: 100, name: 'shelf', nullable: false })
  shelf: string;

  @Column('varchar', { length: 100, name: 'type', nullable: false })
  type: string;

  @Column('varchar', {
    length: 100,
    name: 'rotation_classification',
    nullable: false,
  })
  rotationClassification: string;

  @Column('int', { name: 'min_stock', nullable: false })
  minStock: number;

  @Column('int', { name: 'max_stock', nullable: false })
  maxStock: number;

  @Column('boolean', { name: 'active', nullable: false, default: true })
  active: boolean;

  @Column('varchar', { length: 255, name: 'image_url', nullable: true })
  imageUrl: string;

  @OneToMany(
    () => WarehouseArticle,
    (warehouseArticle) => warehouseArticle.article,
  )
  warehouseArticles: WarehouseArticle[];

  @ManyToOne(() => Brand, (brand) => brand.article)
  brand: Brand;

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
}
