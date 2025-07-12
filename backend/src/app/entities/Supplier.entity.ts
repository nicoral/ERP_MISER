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
import { FinalSelectionServiceItem } from './FinalSelectionServiceItem.entity';

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

  @Column('varchar', { length: 100, name: 'bank_account_pen', nullable: true })
  bankAccountPEN: string;

  @Column('varchar', {
    length: 100,
    name: 'interbank_account_pen',
    nullable: true,
  })
  interbankAccountPEN: string;

  @Column('varchar', {
    length: 100,
    name: 'entity_bank_account_pen',
    nullable: true,
  })
  entityBankAccountPEN: string;

  @Column('varchar', { length: 100, name: 'bank_account_usd', nullable: true })
  bankAccountUSD: string;

  @Column('varchar', {
    length: 100,
    name: 'interbank_account_usd',
    nullable: true,
  })
  interbankAccountUSD: string;

  @Column('varchar', {
    length: 100,
    name: 'entity_bank_account_usd',
    nullable: true,
  })
  entityBankAccountUSD: string;

  @Column('boolean', { name: 'return_policy', default: true })
  returnPolicy: boolean;

  @Column('boolean', { name: 'applies_withholding', default: false })
  appliesWithholding: boolean;

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

  @OneToMany(
    () => FinalSelectionServiceItem,
    finalSelectionServiceItem => finalSelectionServiceItem.supplier
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
