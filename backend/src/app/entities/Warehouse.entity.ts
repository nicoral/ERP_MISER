import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Employee } from './Employee.entity';
import { WarehouseArticle } from './WarehouseArticle.entity';

@Entity()
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100, name: 'name', nullable: false })
  name: string;

  @Column('varchar', { length: 255, name: 'address', nullable: false })
  address: string;

  @Column('date', { name: 'hire_date', nullable: true })
  hireDate: Date;

  @Column('date', { name: 'dismissal_date', nullable: true })
  dismissalDate: Date;

  @Column('boolean', { name: 'active', nullable: false })
  active: boolean;

  @Column('decimal', { name: 'valued', nullable: false })
  valued: number;

  @ManyToOne(() => Employee, employee => employee.warehouses)
  manager: Employee;

  @ManyToMany(() => Employee, employee => employee.warehousesAssigned)
  employees: Employee[];

  @OneToMany(
    () => WarehouseArticle,
    warehouseArticle => warehouseArticle.warehouse
  )
  warehouseArticles: WarehouseArticle[];

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
