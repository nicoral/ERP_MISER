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
import { EntryPart } from './EntryPart.entity';
import { Service } from './Service.entity';
import { InspectionStatus } from '../common/enum';

@Entity()
export class EntryPartService {
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

  @ManyToOne(() => EntryPart, entryPart => entryPart.entryPartServices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entry_part_id' })
  entryPart: EntryPart;

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
