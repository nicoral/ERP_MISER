import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RequirementService } from './RequirementService.entity';
import { Supplier } from './Supplier.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, name: 'name', nullable: false })
  name: string;

  @Column('varchar', { length: 100, name: 'code', nullable: false })
  code: string;

  @Column('boolean', { name: 'active', nullable: false, default: true })
  active: boolean;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'default_supplier_id' })
  defaultSupplier: Supplier;

  @OneToMany(
    () => RequirementService,
    requirementService => requirementService.service,
    { cascade: true, onDelete: 'CASCADE' }
  )
  requirementServices: RequirementService[];

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
