import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { SupplierStatus } from '../common/enum';
import { QuotationSupplier } from './QuotationSupplier.entity';
import { FinalSelectionItem } from './FinalSelectionItem.entity';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, name: 'ruc', nullable: false })
  ruc: string;

  @Column('varchar', { length: 100, name: 'business_name', nullable: false })
  businessName: string;

  @Column('varchar', { length: 100, name: 'address', nullable: true })
  address: string;

  @Column('varchar', { length: 100, name: 'contact_person', nullable: false })
  contactPerson: string;

  @Column('varchar', { length: 100, name: 'mobile', nullable: false })
  mobile: string;

  @Column('varchar', { length: 100, name: 'email', nullable: true })
  email: string;

  @Column('varchar', { length: 100, name: 'bank_account', nullable: true })
  bankAccount: string;

  @Column('boolean', { name: 'return_policy', default: true })
  returnPolicy: boolean;

  @Column('numeric', { name: 'rating', default: 50, precision: 10, scale: 2 })
  rating: number;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
    name: 'status',
  })
  status: SupplierStatus;

  @Column('text', { name: 'lines', nullable: true })
  lines: string;

  @OneToMany(
    () => QuotationSupplier,
    quotationSupplier => quotationSupplier.supplier
  )
  quotationSuppliers: QuotationSupplier[];

  @OneToMany(
    () => FinalSelectionItem,
    finalSelectionItem => finalSelectionItem.supplier
  )
  finalSelectionItems: FinalSelectionItem[];

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
