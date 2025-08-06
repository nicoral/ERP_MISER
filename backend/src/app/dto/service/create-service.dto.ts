import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  defaultSupplierId?: number;
}
