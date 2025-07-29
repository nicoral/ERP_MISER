import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { WarehouseArticle } from './WarehouseArticle.entity';
import { Brand } from './Brand.entity';
import { RequirementArticle } from './RequirementArticle.entity';
import { EntryPartArticle } from './EntryPartArticle.entity';

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

  @Column('varchar', { length: 100, name: 'type', nullable: false })
  type: string;

  @Column('varchar', {
    length: 100,
    name: 'rotation_classification',
    nullable: false,
  })
  rotationClassification: string;

  @Column('boolean', { name: 'active', nullable: false, default: true })
  active: boolean;

  @Column('varchar', { length: 255, name: 'image_url', nullable: true })
  imageUrl: string;

  @Column('varchar', { length: 255, name: 'technical_sheet_url', nullable: true })
  technicalSheetUrl: string;

  @OneToMany(
    () => WarehouseArticle,
    warehouseArticle => warehouseArticle.article,
    { cascade: true, onDelete: 'CASCADE' }
  )
  warehouseArticles: WarehouseArticle[];

  @OneToMany(
    () => RequirementArticle,
    requirementArticle => requirementArticle.article,
    { cascade: true, onDelete: 'CASCADE' }
  )
  requirementArticles: RequirementArticle[];

  @OneToMany(
    () => EntryPartArticle,
    entryPartArticle => entryPartArticle.article,
    { cascade: true, onDelete: 'CASCADE' }
  )
  entryPartArticles: EntryPartArticle[];

  @ManyToOne(() => Brand, brand => brand.article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
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

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date;
}
