import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

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

export class ApplyGeneralTermsDto {
  @IsNotEmpty()
  @IsString()
  terms: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  selectedArticles?: number[];
} 