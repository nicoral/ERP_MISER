import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FuelOutputStatus } from '../common/enum';
import { FuelDailyControl } from './FuelDailyControl.entity';
import { Employee } from './Employee.entity';
import { ApprovalFlowBase } from './ApprovalFlowBase.entity';
import { CostCenter } from './CostCenter.entity';

@Entity()
export class FuelOutput extends ApprovalFlowBase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FuelDailyControl, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fuel_daily_control_id' })
  fuelDailyControl: FuelDailyControl;

  @Column('decimal', { precision: 10, scale: 2, name: 'quantity', nullable: false })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'hour_meter', nullable: false })
  hourMeter: number;

  @Column({
    type: 'enum',
    enum: FuelOutputStatus,
    default: FuelOutputStatus.PENDING,
  })
  status: FuelOutputStatus;

  // Centro de costo
  @ManyToOne(() => CostCenter, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter: CostCenter;

  // Empleado que registra la salida
  @ManyToOne(() => Employee, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registered_by_employee_id' })
  registeredByEmployee: Employee;

  // Operador que firma (usando firstSignature de ApprovalFlowBase)
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'operator_employee_id' })
  operatorEmployee: Employee;

  @Column('time', { name: 'output_time', nullable: false })
  outputTime: string;

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