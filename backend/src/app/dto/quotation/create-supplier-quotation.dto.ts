import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierQuotationItemDto {
  @IsNotEmpty()
  @IsNumber()
  articleId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  deliveryTime?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  reasonNotAvailable?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateSupplierQuotationDto {
  @IsNotEmpty()
  @IsNumber()
  quotationRequestId: number;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierQuotationItemDto)
  items: CreateSupplierQuotationItemDto[];
} 