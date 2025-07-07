import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSupplierQuotationItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

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
}

export class UpdateSupplierQuotationDto {
  @IsOptional()
  @IsString()
  notes?: string;

  

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSupplierQuotationItemDto)
  items: UpdateSupplierQuotationItemDto[];
}

export class UpdateSupplierQuotationOcDto  {
  @IsOptional()
  @IsString()
  methodOfPayment?: string;

  @IsOptional()
  @IsString()
  igv?: string;

}