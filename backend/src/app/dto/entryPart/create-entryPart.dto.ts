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
import { InspectionStatus } from '../../common/enum';

export class CreateEntryPartArticleDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  received: number;

  @IsOptional()
  conform?: boolean;

  @IsOptional()
  qualityCert?: boolean;

  @IsOptional()
  guide?: boolean;

  @IsOptional()
  @IsString()
  inspection?: InspectionStatus;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsNumber()
  articleId: number;
}

export class CreateEntryPartDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsDateString()
  entryDate: string;

  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @IsOptional()
  @IsNumber()
  warehouseId?: number;

  @IsOptional()
  @IsNumber()
  purchaseOrderId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntryPartArticleDto)
  entryPartArticles: CreateEntryPartArticleDto[];
}
