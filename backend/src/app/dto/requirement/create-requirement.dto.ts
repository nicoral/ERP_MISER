import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Currency, RequirementPriority } from '../../common/enum';

export class CreateRequirementArticleDto {
  @IsNotEmpty()
  @IsString()
  articleId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @IsString()
  justification: string;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;
}

export class CreateRequirementDto {
  @IsNotEmpty()
  @IsEnum(RequirementPriority)
  priority: RequirementPriority;

  @IsOptional()
  @IsString()
  observation: string;

  @IsNotEmpty()
  @IsString()
  costCenterId: string;

  @IsNotEmpty()
  @IsString()
  costCenterSecondaryId: string;

  @IsNotEmpty()
  @IsString()
  warehouseId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementArticleDto)
  requirementArticles: CreateRequirementArticleDto[];
}
