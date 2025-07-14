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
import { QuotationRequest } from './QuotationRequest.entity';
import { Employee } from './Employee.entity';
import { FinalSelectionItem } from './FinalSelectionItem.entity';
import { FinalSelectionServiceItem } from './FinalSelectionServiceItem.entity';

export enum FinalSelectionStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  GENERATED = 'GENERATED',
}

@Entity()
export class FinalSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: FinalSelectionStatus,
    default: FinalSelectionStatus.DRAFT,
  })
  status: FinalSelectionStatus;

  @OneToOne(
    () => QuotationRequest,
    quotationRequest => quotationRequest.finalSelection,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @ManyToOne(() => Employee, employee => employee.finalSelections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: Employee;

  @OneToMany(
    () => FinalSelectionItem,
    finalSelectionItem => finalSelectionItem.finalSelection,
    { cascade: true, onDelete: 'CASCADE' }
  )
  finalSelectionItems: FinalSelectionItem[];

  @OneToMany(
    () => FinalSelectionServiceItem,
    finalSelectionServiceItem => finalSelectionServiceItem.finalSelection,
    { cascade: true, onDelete: 'CASCADE' }
  )
  finalSelectionServiceItems: FinalSelectionServiceItem[];

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
