import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { RequirementPriority, RequirementStatus } from '../common/enum';
import { Employee } from './Employee.entity';
import { CostCenter } from './CostCenter.entity';
import { RequirementArticle } from './RequirementArticle.entity';
import { Warehouse } from './Warehouse.entity';
import { ApprovalFlowBase } from './ApprovalFlowBase.entity';

@Entity()
export class Requirement extends ApprovalFlowBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  priority: RequirementPriority;

  @Column('text', { nullable: true })
  observation: string;

  @Column({ enum: RequirementStatus, default: RequirementStatus.PENDING })
  status: RequirementStatus;

  @ManyToOne(() => Employee, employee => employee.requirements)
  employee: Employee;

  @ManyToOne(() => CostCenter, costCenter => costCenter.requirements)
  costCenter: CostCenter;

  @ManyToOne(() => CostCenter, costCenter => costCenter.requirements)
  costCenterSecondary: CostCenter;

  @ManyToOne(() => Warehouse, warehouse => warehouse.requirements)
  warehouse: Warehouse;

  @OneToMany(
    () => RequirementArticle,
    requirementArticle => requirementArticle.requirement
  )
  requirementArticles: RequirementArticle[];

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
