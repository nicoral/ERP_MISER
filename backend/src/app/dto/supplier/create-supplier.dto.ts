import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SupplierStatus } from '../../common/enum';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  ruc: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  bankAccountPEN: string;

  @IsOptional()
  @IsString()
  interbankAccountPEN: string;

  @IsOptional()
  @IsString()
  entityBankAccountPEN: string;

  @IsOptional()
  @IsString()
  bankAccountUSD: string;

  @IsOptional()
  @IsString()
  interbankAccountUSD: string;

  @IsOptional()
  @IsString()
  entityBankAccountUSD: string;

  @IsOptional()
  @IsBoolean()
  appliesWithholding: boolean;
  
  @IsOptional()
  @IsBoolean()
  returnPolicy: boolean;

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  lines: string;

  @IsNotEmpty()
  @IsEnum(SupplierStatus)
  status: SupplierStatus;
}
