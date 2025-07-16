import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Requirement } from './Requirement.entity';
import { Employee } from './Employee.entity';
import { QuotationSupplier } from './QuotationSupplier.entity';
import { FinalSelection } from './FinalSelection.entity';
import { ApprovalFlowBase } from './ApprovalFlowBase.entity';

export enum QuotationRequestStatus {
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class QuotationRequest extends ApprovalFlowBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: QuotationRequestStatus,
    default: QuotationRequestStatus.PENDING,
  })
  status: QuotationRequestStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'integer', default: 0 })
  progress: number;

  @ManyToOne(() => Requirement, requirement => requirement.quotationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requirement_id' })
  requirement: Requirement;

  @ManyToOne(() => Employee, employee => employee.quotationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: Employee;

  @OneToMany(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.quotationRequest,
    { cascade: true, onDelete: 'CASCADE' }
  )
  quotationSuppliers: QuotationSupplier[];

  @OneToOne(
    () => FinalSelection,
    finalSelection => finalSelection.quotationRequest
  )
  finalSelection: FinalSelection;

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
