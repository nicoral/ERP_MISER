import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  documentId: string;

  @IsOptional()
  documentType: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  position: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  address: string;

  @IsOptional()
  role: number;

  @IsOptional()
  active: boolean;

  @IsOptional()
  imageUrl: string;

  @IsOptional()
  hireDate: Date;

  @IsOptional()
  dismissalDate: Date;

  @IsOptional()
  warehousesAssigned: number[];
}
