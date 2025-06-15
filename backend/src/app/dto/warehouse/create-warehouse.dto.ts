import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @Transform(({ value }) => value ? new Date(value).toISOString().slice(0, 10) : value)
  hireDate: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value).toISOString().slice(0, 10) : value)
  dismissalDate?: Date;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsNotEmpty()
  @IsNumber()
  valued: number;
}
