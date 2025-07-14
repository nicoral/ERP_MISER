import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuotationSupplier } from './QuotationSupplier.entity';
import { RequirementService } from './RequirementService.entity';

@Entity()
export class QuotationSupplierService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  quantity: number;

  @ManyToOne(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.quotationSupplierServices,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'quotation_supplier_id' })
  quotationSupplier: QuotationSupplier;

  @ManyToOne(
    () => RequirementService,
    requirementService => requirementService.quotationSupplierServices,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'requirement_service_id' })
  requirementService: RequirementService;

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
