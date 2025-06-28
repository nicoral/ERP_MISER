import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateQuotationSupplierDto {
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;
}

export class UpdateQuotationSupplierArticleDto {
  @IsNotEmpty()
  @IsNumber()
  requirementArticleId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class UpdateQuotationRequestDto {
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationSupplierDto)
  suppliers?: UpdateQuotationSupplierDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationSupplierArticleDto)
  supplierArticles?: UpdateQuotationSupplierArticleDto[];
}
