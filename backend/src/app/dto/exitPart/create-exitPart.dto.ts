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

export class CreateExitPartArticleDto {
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
  delivered: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

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

export class CreateExitPartDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsDateString()
  exitDate: string;

  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @IsNotEmpty()
  @IsNumber()
  warehouseId: number;

  @IsOptional()
  @IsNumber()
  purchaseOrderId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExitPartArticleDto)
  exitPartArticles: CreateExitPartArticleDto[];
}
