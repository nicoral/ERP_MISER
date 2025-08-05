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
import { ServiceDurationType } from '../../entities/RequirementService.entity';

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

  @IsOptional()
  @IsString()
  justification: string;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;
}

export class CreateRequirementServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  justification: string;

  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsEnum(ServiceDurationType)
  durationType?: ServiceDurationType;

  @IsOptional()
  @IsNumber()
  duration?: number;
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

  @IsOptional()
  @IsString()
  type?: 'ARTICLE' | 'SERVICE';

  @IsOptional()
  @IsString()
  subType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementArticleDto)
  requirementArticles?: CreateRequirementArticleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementServiceDto)
  requirementServices?: CreateRequirementServiceDto[];

  // Configuración simple de firmas
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSignatures?: string[]; // Array de roles: ['SOLICITANTE', 'OFICINA_TECNICA', etc.]
}
