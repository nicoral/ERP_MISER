import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
  hireDate: Date;

  @IsOptional()
  dismissalDate: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  warehousesAssigned: number[];
}
