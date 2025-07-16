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
import { FinalSelection } from './FinalSelection.entity';
import { RequirementService } from './RequirementService.entity';
import { Supplier } from './Supplier.entity';
import { SupplierQuotationServiceItem } from './SupplierQuotationServiceItem.entity';

@Entity()
export class FinalSelectionServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ default: 'PEN' })
  currency: string;

  @Column({ nullable: true })
  deliveryTime: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ['HORA', 'CONTRATO', 'DIA', 'JORNADA'],
    nullable: true,
  })
  durationType: 'HORA' | 'CONTRATO' | 'DIA' | 'JORNADA';

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @ManyToOne(
    () => FinalSelection,
    finalSelection => finalSelection.finalSelectionServiceItems,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'final_selection_id' })
  finalSelection: FinalSelection;

  @ManyToOne(
    () => RequirementService,
    requirementService => requirementService.finalSelectionServiceItems,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'requirement_service_id' })
  requirementService: RequirementService;

  @ManyToOne(() => Supplier, supplier => supplier.finalSelectionServiceItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(
    () => SupplierQuotationServiceItem,
    supplierQuotationServiceItem =>
      supplierQuotationServiceItem.finalSelectionServiceItems,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'supplier_quotation_service_item_id' })
  supplierQuotationServiceItem: SupplierQuotationServiceItem;

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
