import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFuelDailyControlDto {
  @IsNotEmpty()
  @IsNumber()
  warehouseId: number;

  @IsOptional()
  @IsString()
  observations?: string;
} 