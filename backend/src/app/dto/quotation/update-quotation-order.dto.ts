import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  ValidateNested,
} from 'class-validator';

export class UpdateQuotationOrderDto {
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  selectedArticles?: number[];
}

export class SendQuotationOrderDto {
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}

class SelectedArticlesDto {
  @IsNotEmpty()
  @IsNumber()
  articleId: number;

  @IsNumber()
  quantity: number;
}

export class ApplyGeneralTermsDto {
  @IsNotEmpty()
  @IsString()
  terms: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedArticlesDto)
  selectedArticles?: SelectedArticlesDto[];
}
