import { IsString, IsOptional } from 'class-validator';

export class GeneratePurchaseOrdersDto {
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
