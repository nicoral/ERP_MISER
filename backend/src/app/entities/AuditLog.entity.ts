import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Employee } from './Employee.entity';
import { Type } from 'class-transformer';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column('varchar', { length: 100, name: 'entity', nullable: true })
  entity: string;

  @Column('varchar', { length: 100, name: 'entity_id', nullable: true })
  entityId: string;

  @ManyToOne(() => Employee, { nullable: true })
  employee: Employee;

  @CreateDateColumn({
    name: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @Column('varchar', { length: 100, name: 'url', nullable: true })
  url: string;

  @Column('varchar', { length: 100, name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column('jsonb', { name: 'old_value', nullable: true })
  @Type(() => Object)
  oldValue: object;

  @Column('jsonb', { name: 'new_value', nullable: true })
  @Type(() => Object)
  newValue: object;

  @Column('varchar', { length: 100, name: 'details', nullable: true })
  details: string;
}
