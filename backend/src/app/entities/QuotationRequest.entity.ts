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

export enum QuotationRequestStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class QuotationRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: QuotationRequestStatus,
    default: QuotationRequestStatus.DRAFT,
  })
  status: QuotationRequestStatus;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => Requirement, requirement => requirement.quotationRequests)
  @JoinColumn({ name: 'requirement_id' })
  requirement: Requirement;

  @ManyToOne(() => Employee, employee => employee.quotationRequests)
  @JoinColumn({ name: 'created_by' })
  createdBy: Employee;

  @OneToMany(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.quotationRequest
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
