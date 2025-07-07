import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { PaymentStatus } from '../../entities/PaymentGroup.entity';

export class UpdatePaymentGroupDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pendingAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
