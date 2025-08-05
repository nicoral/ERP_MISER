import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Employee } from './Employee.entity';

@Entity()
export class DocumentApprovalConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50 })
  entityType: string; // 'requirement', 'quotation', 'fuel_control'

  @Column('int')
  entityId: number; // ID del documento específico

  @Column('int')
  signatureLevel: number; // 1, 2, 3, 4

  @Column('varchar', { length: 100 })
  roleName: string; // 'SOLICITANTE', 'OFICINA_TECNICA', etc.

  @Column('boolean', { default: true })
  isRequired: boolean;

  @Column('boolean', { default: true })
  isActive: boolean;

  @ManyToOne(() => Employee, { nullable: true })
  updatedBy: Employee;

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
