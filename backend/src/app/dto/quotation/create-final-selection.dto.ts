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
  @IsString()
  articleId: string;

  @IsNotEmpty()
  @IsString()
  supplierId: string;

  @IsNotEmpty()
  @IsNumber()
  selectedPrice: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateFinalSelectionDto {
  @IsNotEmpty()
  @IsString()
  quotationRequestId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFinalSelectionItemDto)
  items: CreateFinalSelectionItemDto[];
}
