import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 