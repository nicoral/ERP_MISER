import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsDate,
  IsDecimal,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsNumber()
  item: number;

  @IsString()
  code: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  description: string;

  @IsString()
  brand: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  type?: 'ARTICLE' | 'SERVICE';

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  durationType?: string;
}

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsNumber()
  quotationRequestId?: number;

  @IsNotEmpty()
  @IsNumber()
  requirementId?: number;

  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsNumber()
  createdById?: number;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsString()
  supplierName: string;

  @IsString()
  supplierRUC: string;

  @IsString()
  supplierAddress: string;

  @IsOptional()
  @IsString()
  supplierLocation?: string;

  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @IsString()
  deliveryDate: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  igv: number;

  @IsDecimal()
  subtotal: number;

  @IsDecimal()
  total: number;

  @IsString()
  currency: string;
}
