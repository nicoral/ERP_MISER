import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

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

export class UpdateQuotationSuppliersDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationSupplierDto)
  suppliers: UpdateQuotationSupplierDto[];

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationSupplierArticleDto)
  supplierArticles: UpdateQuotationSupplierArticleDto[];
}
