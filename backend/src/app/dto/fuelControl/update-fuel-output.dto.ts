import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class UpdateFuelOutputDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  equipmentCode?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  observations?: string;
} 