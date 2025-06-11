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
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './Role.entity';
import { Warehouse } from './Warehouse.entity';

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
  @Column('varchar', { length: 100, name: 'password', nullable: false })
  password: string;

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

  @ManyToOne(() => Role, (role) => role.employees)
  role: Role;

  @OneToMany(() => Warehouse, (warehouse) => warehouse.manager)
  warehouses: Warehouse[];

  @ManyToMany(() => Warehouse, (warehouse) => warehouse.employees)
  @JoinTable()
  warehousesAssigned: Warehouse[];

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
}
