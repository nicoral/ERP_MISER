import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Requirement } from './Requirement.entity';

@Entity()
export class CostCenter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, name: 'code', nullable: true })
  code: string;

  @Column('varchar', { length: 100, name: 'serial', nullable: true })
  serial: string;

  @Column('varchar', { length: 100, name: 'codeMine', nullable: true })
  codeMine: string;

  @Column('text', { name: 'description', nullable: false })
  description: string;

  @OneToMany(() => Requirement, requirement => requirement.costCenter)
  requirements: Requirement[];

  @ManyToOne(() => CostCenter, costCenter => costCenter.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: CostCenter;

  @OneToMany(() => CostCenter, costCenter => costCenter.parent)
  children: CostCenter[];

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
