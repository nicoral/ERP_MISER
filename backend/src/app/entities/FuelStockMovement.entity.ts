import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FuelMovementType } from '../common/enum';
import { Warehouse } from './Warehouse.entity';
import { Employee } from './Employee.entity';

@Entity()
export class FuelStockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: FuelMovementType,
    nullable: false,
  })
  movementType: FuelMovementType;

  @Column('decimal', { precision: 10, scale: 2, name: 'quantity', nullable: false })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'stock_before', nullable: false })
  stockBefore: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'stock_after', nullable: false })
  stockAfter: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column('text', { name: 'observations', nullable: true })
  observations: string;

  @Column('timestamp', { name: 'movement_date', nullable: false })
  movementDate: Date;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
} 