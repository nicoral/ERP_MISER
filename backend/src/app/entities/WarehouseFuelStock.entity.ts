import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './Warehouse.entity';

@Entity()
export class WarehouseFuelStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column('decimal', { precision: 10, scale: 2, name: 'current_stock', nullable: false, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'min_stock', nullable: false, default: 0 })
  minStock: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'max_stock', nullable: false, default: 0 })
  maxStock: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'tank_capacity', nullable: false })
  tankCapacity: number;

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