import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFinalSelectionItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsNumber()
  selectedPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateFinalSelectionServiceItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

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

export class UpdateFinalSelectionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFinalSelectionItemDto)
  items?: UpdateFinalSelectionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFinalSelectionServiceItemDto)
  serviceItems?: UpdateFinalSelectionServiceItemDto[];
}
