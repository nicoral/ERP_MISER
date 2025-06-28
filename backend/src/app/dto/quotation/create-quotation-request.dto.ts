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

export class CreateQuotationSupplierDto {
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;
}

export class CreateQuotationSupplierArticleDto {
  @IsNotEmpty()
  @IsNumber()
  requirementArticleId: number; // ID del RequirementArticle del requerimiento original

  @IsNotEmpty()
  @IsNumber()
  quantity: number; // Cantidad específica para este proveedor (puede ser diferente al requerimiento original)
}

export class CreateQuotationRequestDto {
  @IsNotEmpty()
  @IsNumber()
  requirementId: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationSupplierDto)
  suppliers?: CreateQuotationSupplierDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationSupplierArticleDto)
  supplierArticles?: CreateQuotationSupplierArticleDto[];
}
