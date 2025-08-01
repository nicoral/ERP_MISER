import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExitPart } from './ExitPart.entity';
import { Article } from './Article.entity';
import { InspectionStatus } from '../common/enum';

@Entity()
export class ExitPartArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  delivered: number;

  @Column({ type: 'boolean', default: true })
  conform: boolean;

  @Column({ type: 'boolean', default: true })
  qualityCert: boolean;

  @Column({ type: 'boolean', default: true })
  guide: boolean;

  @Column({ type: 'integer', default: 0 })
  valued: number;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.PENDING,
  })
  inspection: InspectionStatus;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @ManyToOne(() => ExitPart, exitPart => exitPart.exitPartArticles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exit_part_id' })
  exitPart: ExitPart;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'article_id' })
  article: Article;

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
