import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class GeneralSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 255,
    name: 'company_name',
    nullable: false,
    default: 'MISER ERP',
  })
  companyName: string;

  @Column('varchar', {
    length: 500,
    name: 'company_logo_url',
    nullable: true,
  })
  companyLogoUrl: string | null;

  @Column('decimal', {
    precision: 10,
    scale: 4,
    name: 'exchange_rate_sale',
    nullable: true,
  })
  exchangeRateSale: number | null;

  @Column('decimal', {
    precision: 10,
    scale: 4,
    name: 'exchange_rate_purchase',
    nullable: true,
  })
  exchangeRatePurchase: number | null;

  @Column('date', {
    name: 'exchange_rate_date',
    nullable: true,
  })
  exchangeRateDate: Date | null;

  @Column('varchar', {
    length: 20,
    name: 'exchange_rate_date_string',
    nullable: true,
  })
  exchangeRateDateString: string | null;

  @Column('boolean', {
    name: 'exchange_rate_auto_update',
    default: true,
  })
  exchangeRateAutoUpdate: boolean;

  @Column('varchar', {
    length: 100,
    name: 'timezone',
    default: 'America/Lima',
  })
  timezone: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    name: 'general_tax',
    default: 18,
  })
  generalTax: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    name: 'low_amount_threshold',
    default: 10000,
  })
  lowAmountThreshold: number;

  @Column('text', {
    name: 'additional_settings',
    nullable: true,
  })
  additionalSettings: string | null;

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
