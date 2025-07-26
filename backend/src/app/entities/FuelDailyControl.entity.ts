import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { FuelDailyControlStatus } from '../common/enum';
import { Warehouse } from './Warehouse.entity';
import { ApprovalFlowBase } from './ApprovalFlowBase.entity';
import { FuelOutput } from './FuelOutput.entity';

@Entity()
export class FuelDailyControl extends ApprovalFlowBase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column('date', { name: 'control_date', nullable: false })
  controlDate: Date;

  @Column({
    type: 'enum',
    enum: FuelDailyControlStatus,
    default: FuelDailyControlStatus.OPEN,
  })
  status: FuelDailyControlStatus;

  @Column('decimal', { precision: 10, scale: 2, name: 'opening_stock', nullable: false })
  openingStock: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'closing_stock', nullable: true })
  closingStock: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_outputs', nullable: false, default: 0 })
  totalOutputs: number;

  @Column('text', { name: 'observations', nullable: true })
  observations: string;

  @OneToMany(() => FuelOutput, fuelOutput => fuelOutput.fuelDailyControl, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  fuelOutputs: FuelOutput[];

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