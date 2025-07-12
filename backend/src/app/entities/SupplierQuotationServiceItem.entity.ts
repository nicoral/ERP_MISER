import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SupplierQuotation } from './SupplierQuotation.entity';
import { RequirementService } from './RequirementService.entity';
import { FinalSelectionServiceItem } from './FinalSelectionServiceItem.entity';

export enum QuotationServiceItemStatus {
  QUOTED = 'QUOTED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NOT_QUOTED = 'NOT_QUOTED',
}

@Entity()
export class SupplierQuotationServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: QuotationServiceItemStatus,
    default: QuotationServiceItemStatus.NOT_QUOTED,
  })
  status: QuotationServiceItemStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ default: 'PEN' })
  currency: string;

  @Column({ nullable: true })
  deliveryTime: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  reasonNotAvailable: string;

  @Column({
    type: 'enum',
    enum: ['HORA', 'CONTRATO', 'DIA', 'JORNADA'],
    nullable: true,
  })
  durationType: 'HORA' | 'CONTRATO' | 'DIA' | 'JORNADA';

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @ManyToOne(
    () => SupplierQuotation,
    supplierQuotation => supplierQuotation.supplierQuotationServiceItems
  )
  @JoinColumn({ name: 'supplier_quotation_id' })
  supplierQuotation: SupplierQuotation;

  @ManyToOne(
    () => RequirementService,
    requirementService => requirementService.supplierQuotationServiceItems
  )
  @JoinColumn({ name: 'requirement_service_id' })
  requirementService: RequirementService;

  @OneToMany(
    () => FinalSelectionServiceItem,
    finalSelectionServiceItem =>
      finalSelectionServiceItem.supplierQuotationServiceItem
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
