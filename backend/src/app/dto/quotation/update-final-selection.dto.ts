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

  @IsOptional()
  @IsNumber()
  selectedPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateFinalSelectionDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFinalSelectionItemDto)
  items: UpdateFinalSelectionItemDto[];
}
