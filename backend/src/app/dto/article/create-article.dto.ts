import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateArticleWarehouseDto {
  @IsNotEmpty()
  warehouseId: number;

  @IsNotEmpty()
  stock: number;

  @IsNotEmpty()
  minStock: number;

  @IsNotEmpty()
  maxStock: number;

  @IsNotEmpty()
  line: string;

  @IsNotEmpty()
  shelf: string;
}

export class CreateArticleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  unitOfMeasure: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  rotationClassification: string;

  @IsNotEmpty()
  @IsOptional()
  active: boolean;

  @IsOptional()
  brandId: number;

  @IsOptional()
  technicalSheetUrl?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleWarehouseDto)
  warehouseArticles: CreateArticleWarehouseDto[];
}
