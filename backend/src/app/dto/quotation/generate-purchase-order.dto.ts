import { IsString } from 'class-validator';

export class GeneratePurchaseOrderDto {
  @IsString()
  paymentMethod: string;

  @IsString()
  supplierId: string;
}
