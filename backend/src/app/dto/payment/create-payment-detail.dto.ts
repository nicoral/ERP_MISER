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
  @IsString()
  retentionDocument?: string; // URL de Cloudinary del documento de retención

  @IsOptional()
  @IsEnum(PhysicalReceipt)
  physicalReceipt?: PhysicalReceipt;

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
