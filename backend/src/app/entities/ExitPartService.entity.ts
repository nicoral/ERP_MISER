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
import { InspectionStatus } from '../common/enum';
import { Service } from './Service.entity';

@Entity()
export class ExitPartService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  duration: number;

  @Column({ type: 'varchar', length: 20 })
  durationType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  received: number;

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

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

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
