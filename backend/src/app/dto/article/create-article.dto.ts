import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateArticleWarehouseDto {
  @IsNotEmpty()
  warehouseId: number;

  @IsNotEmpty()
  stock: number;
}

export class CreateArticleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  unitOfMeasure: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  line: string;

  @IsNotEmpty()
  shelf: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  rotationClassification: string;

  @IsNotEmpty()
  minStock: number;

  @IsNotEmpty()
  maxStock: number;

  @IsOptional()
  active: boolean;

  @IsOptional()
  brandId: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleWarehouseDto)
  warehouseArticles: CreateArticleWarehouseDto[];
}
