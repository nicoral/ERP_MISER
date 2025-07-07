import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import {
  PaymentDetailStatus,
  PhysicalReceipt,
} from '../../entities/PaymentDetail.entity';

export class CreatePaymentDetailDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  paymentGroupId: number;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;
}

export class UpdatePaymentDetailReceiptDto {
  @IsOptional()
  @IsString()
  paymentReceipt?: string;

  @IsOptional()
  @IsString()
  depositDate?: string;

  @IsOptional()
  @IsString()
  movementNumber?: string;

  @IsOptional()
  @IsString()
  receiptImage?: string; // URL de Cloudinary

  @IsOptional()
  @IsEnum(PhysicalReceipt)
  physicalReceipt?: PhysicalReceipt;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePaymentDetailInvoiceDto {
  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  invoiceEmissionDate?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  invoiceImage?: string; // URL de Cloudinary

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePaymentDetailStatusDto {
  @IsNotEmpty()
  @IsEnum(PaymentDetailStatus)
  status: PaymentDetailStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
