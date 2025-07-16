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
import { RequirementService } from './RequirementService.entity';
import { Warehouse } from './Warehouse.entity';
import { ApprovalFlowBase } from './ApprovalFlowBase.entity';
import { QuotationRequest } from './QuotationRequest.entity';
import { PurchaseOrder } from './PurchaseOrder.entity';

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

  @Column({
    type: 'enum',
    enum: ['ARTICLE', 'SERVICE'],
    default: 'ARTICLE',
  })
  type: 'ARTICLE' | 'SERVICE';

  @ManyToOne(() => Employee, employee => employee.requirements, {
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @ManyToOne(() => CostCenter, costCenter => costCenter.requirements, {
    onDelete: 'CASCADE',
  })
  costCenter: CostCenter;

  @ManyToOne(() => CostCenter, costCenter => costCenter.requirements, {
    onDelete: 'CASCADE',
  })
  costCenterSecondary: CostCenter;

  @ManyToOne(() => Warehouse, warehouse => warehouse.requirements, {
    onDelete: 'CASCADE',
  })
  warehouse: Warehouse;

  @OneToMany(
    () => RequirementArticle,
    requirementArticle => requirementArticle.requirement,
    { cascade: true, onDelete: 'CASCADE' }
  )
  requirementArticles: RequirementArticle[];

  @OneToMany(
    () => RequirementService,
    requirementService => requirementService.requirement,
    { cascade: true, onDelete: 'CASCADE' }
  )
  requirementServices: RequirementService[];

  @OneToMany(
    () => QuotationRequest,
    quotationRequest => quotationRequest.requirement,
    { cascade: true, onDelete: 'CASCADE' }
  )
  quotationRequests: QuotationRequest[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.requirement, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  purchaseOrders: PurchaseOrder[];

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
