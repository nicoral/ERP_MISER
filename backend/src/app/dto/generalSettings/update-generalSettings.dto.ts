import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdateGeneralSettingsDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUrl()
  companyLogoUrl?: string;

  @IsOptional()
  @IsNumber()
  exchangeRateSale?: number;

  @IsOptional()
  @IsNumber()
  exchangeRatePurchase?: number;

  @IsOptional()
  @IsString()
  exchangeRateDateString?: string;

  @IsOptional()
  @IsBoolean()
  exchangeRateAutoUpdate?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  generalTax?: number;

  @IsOptional()
  @IsString()
  additionalSettings?: string;
}
