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
  bankAccount: string;

  @IsOptional()
  @IsBoolean()
  returnPolicy: boolean;

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsEnum(SupplierStatus)
  status: SupplierStatus;
}
