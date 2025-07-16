import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { QuotationRequest } from './QuotationRequest.entity';
import { Supplier } from './Supplier.entity';
import { Employee } from './Employee.entity';
import { Requirement } from './Requirement.entity';
import { CostCenter } from './CostCenter.entity';
import { PaymentGroup } from './PaymentGroup.entity';
import { EntryPart } from './EntryPart.entity';

export interface PurchaseOrderItem {
  item: number;
  code: string;
  quantity: number;
  unit: string;
  description: string;
  brand: string;
  unitPrice: number;
  amount: number;
  currency: string;
  type?: 'ARTICLE' | 'SERVICE'; // Para distinguir entre artículos y servicios
  duration?: number; // Solo para servicios
  durationType?: string; // Solo para servicios
}

@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  orderNumber: string;

  @Column({ type: 'date' })
  issueDate: Date;

  // Datos del comprador (MYSER)
  @Column({ type: 'varchar', length: 255 })
  buyerName: string;

  @Column({ type: 'varchar', length: 20 })
  buyerRUC: string;

  @Column({ type: 'varchar', length: 500 })
  buyerAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyerLocation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerPhone: string;

  // Datos del proveedor
  @Column({ type: 'varchar', length: 200 })
  supplierName: string;

  @Column({ type: 'varchar', length: 20 })
  supplierRUC: string;

  @Column({ type: 'varchar', length: 500 })
  supplierAddress: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  supplierLocation: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  supplierPhone: string;

  // Artículos en formato JSONB para acceso rápido
  @Column({ type: 'jsonb' })
  items: PurchaseOrderItem[];

  // Condiciones de pago y entrega
  @Column({ type: 'varchar', length: 200, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100 })
  deliveryDate: string;

  // Totales
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  igv: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  // Observaciones
  @Column({ type: 'text', nullable: true })
  observation: string;

  // Relaciones
  @ManyToOne(() => QuotationRequest, { nullable: false })
  @JoinColumn({ name: 'quotation_request_id' })
  quotationRequest: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: Employee;

  @ManyToOne(() => Requirement, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requirement_id' })
  requirement: Requirement;

  @ManyToOne(() => CostCenter, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cost_center_id' })
  costCenterEntity: CostCenter;

  // Relación con los detalles de pago
  @OneToOne(() => PaymentGroup, paymentGroup => paymentGroup.purchaseOrder, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  paymentGroup: PaymentGroup;

  // Relación con las partes de entrada
  @OneToMany(() => EntryPart, entryPart => entryPart.purchaseOrder, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  entryParts: EntryPart[];

  // Timestamps
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

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;
}
