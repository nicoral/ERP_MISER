import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsOptional()
  @IsString()
  documentType: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  role: number;

  @IsOptional()
  active: boolean;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value
  )
  hireDate: Date;

  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value
  )
  dismissalDate: Date;

  @IsOptional()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value
  )
  birthDate: Date;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  warehousesAssigned: number[];
}
