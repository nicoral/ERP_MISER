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

export class CreateEntryPartServiceDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  durationType: string;

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
  serviceId: number;
}

export class CreateEntryPartDto {
  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsDateString()
  entryDate: string;

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
  @Type(() => CreateEntryPartArticleDto)
  entryPartArticles: CreateEntryPartArticleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntryPartServiceDto)
  entryPartServices?: CreateEntryPartServiceDto[];
}
