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

@Entity()
export class Requirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  priority: RequirementPriority;

  @Column('text', { nullable: true })
  observation: string;

  @Column()
  status: RequirementStatus;

  @ManyToOne(() => Employee, employee => employee.requirements)
  employee: Employee;

  @ManyToOne(() => CostCenter, costCenter => costCenter.requirements)
  costCenter: CostCenter;

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
