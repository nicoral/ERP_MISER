import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class UpdateQuotationSupplierArticleDto {
  @IsNotEmpty()
  @IsNumber()
  requirementArticleId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class UpdateQuotationSupplierDto {
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationSupplierArticleDto)
  articles: UpdateQuotationSupplierArticleDto[];
}
