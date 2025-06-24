import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportEmployeeRowDto {
  @IsOptional()
  email?: string;

  @IsOptional()
  documentId?: string;

  @IsOptional()
  documentType?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  area?: string;

  @IsOptional()
  position?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  active?: boolean;

  @IsOptional()
  hireDate?: string;

  @IsOptional()
  birthDate?: string;

  @IsOptional()
  roleId?: number;
}

export class ImportEmployeeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportEmployeeRowDto)
  employees: ImportEmployeeRowDto[];
}
