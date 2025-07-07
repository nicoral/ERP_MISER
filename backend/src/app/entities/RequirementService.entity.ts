import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Service } from './Service.entity';
import { Requirement } from './Requirement.entity';
import { Currency } from '../common/enum';

export enum ServiceDurationType {
  HORA = 'HORA',
  CONTRATO = 'CONTRATO',
  DIA = 'DIA',
  JORNADA = 'JORNADA',
}

@Entity()
export class RequirementService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Requirement, requirement => requirement.requirementServices)
  requirement: Requirement;

  @ManyToOne(() => Service, service => service.requirementServices)
  service: Service;

  @Column('decimal', {
    name: 'unit_price',
    nullable: false,
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Column('text', { name: 'justification', nullable: true })
  justification: string;

  @Column('varchar', { length: 5, name: 'currency', default: 'PEN' })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: ServiceDurationType,
    nullable: true,
  })
  durationType: ServiceDurationType;

  @Column({ type: 'integer', nullable: true })
  duration: number;
}
