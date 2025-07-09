import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  igv?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  observation?: string;
}
