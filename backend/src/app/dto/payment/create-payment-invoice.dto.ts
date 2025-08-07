import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreatePaymentInvoiceDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0) // Allow 0 for initial creation
  amount: number;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  invoiceEmissionDate?: string;

  @IsOptional()
  @IsString()
  invoiceImage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionPercentage?: number;

  @IsOptional()
  @IsBoolean()
  hasRetention?: boolean;

  @IsOptional()
  @IsString()
  retentionDocument?: string;

  @IsNotEmpty()
  @IsNumber()
  paymentDetailId: number;
}

export class UpdatePaymentInvoiceDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01) // Require valid amount for updates
  amount?: number;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  invoiceEmissionDate?: string;

  @IsOptional()
  @IsString()
  invoiceImage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionPercentage?: number;

  @IsOptional()
  @IsBoolean()
  hasRetention?: boolean;
} 