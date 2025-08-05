import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './Role.entity';
import { Warehouse } from './Warehouse.entity';
import { Requirement } from './Requirement.entity';
import { QuotationRequest } from './QuotationRequest.entity';
import { FinalSelection } from './FinalSelection.entity';
import { PaymentDetail } from './PaymentDetail.entity';
import { EntryPart } from './EntryPart.entity';
import { FuelOutput } from './FuelOutput.entity';
import { FuelStockMovement } from './FuelStockMovement.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 100,
    name: 'email',
    nullable: false,
    unique: true,
  })
  email: string;

  @Exclude()
  @Column('varchar', { length: 255, name: 'password', nullable: false })
  password: string;

  @Exclude()
  @Column('varchar', { length: 255, name: 'signature', nullable: true })
  signature: string;

  @Column('varchar', {
    length: 100,
    name: 'document_id',
    nullable: false,
    unique: true,
  })
  documentId: string;

  @Column('varchar', { length: 100, name: 'document_type', default: 'DNI' })
  documentType: string;

  @Column('varchar', { length: 100, name: 'first_name', nullable: false })
  firstName: string;

  @Column('varchar', { length: 100, name: 'last_name', nullable: false })
  lastName: string;

  @Column('varchar', { length: 100, name: 'area', nullable: true })
  area: string;

  @Column('varchar', { length: 100, name: 'position', nullable: false })
  position: string;

  @Column('varchar', { length: 100, name: 'phone', nullable: false })
  phone: string;

  @Column('varchar', { length: 255, name: 'address', nullable: false })
  address: string;

  @Column('boolean', { name: 'active', nullable: false })
  active: boolean;

  @Column('varchar', { length: 255, name: 'image_url', nullable: true })
  imageUrl: string;

  @Column('date', { name: 'hire_date', nullable: true })
  hireDate: Date;

  @Column('date', { name: 'dismissal_date', nullable: true })
  dismissalDate: Date;

  @Column('date', { name: 'birth_date', nullable: true })
  birthDate: Date;

  @ManyToOne(() => Role, role => role.employees, { onDelete: 'CASCADE' })
  role: Role;

  @OneToMany(() => Warehouse, warehouse => warehouse.manager, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  warehouses: Warehouse[];

  @OneToMany(() => Requirement, requirement => requirement.employee, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  requirements: Requirement[];

  @OneToMany(
    () => QuotationRequest,
    quotationRequest => quotationRequest.createdBy,
    { cascade: true, onDelete: 'CASCADE' }
  )
  quotationRequests: QuotationRequest[];

  @OneToMany(() => FinalSelection, finalSelection => finalSelection.createdBy, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  finalSelections: FinalSelection[];

  @ManyToMany(() => Warehouse, warehouse => warehouse.employees)
  @JoinTable()
  warehousesAssigned: Warehouse[];

  @OneToMany(() => PaymentDetail, paymentDetail => paymentDetail.createdBy, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  paymentDetails: PaymentDetail[];

  @OneToMany(() => EntryPart, entryPart => entryPart.employee, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  entryParts: EntryPart[];

  // Fuel Control Relations
  @OneToMany(() => FuelOutput, fuelOutput => fuelOutput.registeredByEmployee, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  registeredFuelOutputs: FuelOutput[];

  @OneToMany(() => FuelOutput, fuelOutput => fuelOutput.operatorEmployee, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  operatedFuelOutputs: FuelOutput[];

  @OneToMany(
    () => FuelStockMovement,
    fuelStockMovement => fuelStockMovement.employee,
    {
      cascade: true,
      onDelete: 'CASCADE',
    }
  )
  fuelStockMovements: FuelStockMovement[];

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
