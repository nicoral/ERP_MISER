import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ApprovalFlowTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  templateName: string; // 'DEFAULT', 'SIMPLIFIED', etc.

  @Column('varchar', { length: 50 })
  entityType: string; // 'requirement', 'quotation', 'fuel_control'

  @Column('int')
  signatureLevel: number; // 1, 2, 3, 4

  @Column('varchar', { length: 100 })
  roleName: string; // 'SOLICITANTE', 'OFICINA_TECNICA', etc.

  @Column('boolean', { default: true })
  isRequired: boolean;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
