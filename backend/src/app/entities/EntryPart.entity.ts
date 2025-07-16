import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './PurchaseOrder.entity';
import { Employee } from './Employee.entity';
import { EntryPartArticle } from './EntryPartArticle.entity';
import { EntryPartService } from './EntryPartService.entity';
import { EntryPartStatus } from '../common/enum';
import { Warehouse } from './Warehouse.entity';

@Entity()
export class EntryPart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: EntryPartStatus,
    default: EntryPartStatus.COMPLETED,
  })
  status: EntryPartStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @Column({ type: 'date' })
  entryDate: Date;

  // Relación con PurchaseOrder (opcional)
  @ManyToOne(() => PurchaseOrder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Relación con Employee (quien registra la entrada)
  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // Relación con los artículos de entrada
  @OneToMany(
    () => EntryPartArticle,
    entryPartArticle => entryPartArticle.entryPart,
    { cascade: true, onDelete: 'CASCADE' }
  )
  entryPartArticles: EntryPartArticle[];

  // Relación con los servicios de entrada
  @OneToMany(
    () => EntryPartService,
    entryPartService => entryPartService.entryPart,
    { cascade: true, onDelete: 'CASCADE' }
  )
  entryPartServices: EntryPartService[];

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
