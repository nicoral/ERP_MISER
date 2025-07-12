import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinalSelectionItemDto {
  @IsNotEmpty()
  @IsNumber()
  articleId: number;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsNotEmpty()
  @IsNumber()
  selectedPrice: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateFinalSelectionServiceItemDto {
  @IsNotEmpty()
  @IsNumber()
  requirementServiceId: number;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  deliveryTime?: number;

  @IsOptional()
  @IsString()
  durationType?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class CreateFinalSelectionDto {
  @IsNotEmpty()
  @IsString()
  quotationRequestId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFinalSelectionItemDto)
  items: CreateFinalSelectionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFinalSelectionServiceItemDto)
  serviceItems?: CreateFinalSelectionServiceItemDto[];
}
