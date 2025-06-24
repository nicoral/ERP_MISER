import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportWarehouseStockDto {
  @IsString()
  warehouseId: number;

  @IsNumber()
  stock: number;

  @IsNumber()
  minStock: number;

  @IsNumber()
  maxStock: number;

  @IsString()
  line: string;

  @IsString()
  shelf: string;

  @IsNumber()
  @IsOptional()
  valued?: number;
}

export class ImportArticleDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  unitOfMeasure: string;

  @IsString()
  type: string;

  @IsString()
  rotationClassification: string;

  @IsBoolean()
  active: boolean;

  @IsString()
  brandName: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportWarehouseStockDto)
  warehouseStocks: ImportWarehouseStockDto[];
}
