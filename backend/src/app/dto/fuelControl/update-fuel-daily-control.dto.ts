import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class UpdateFuelDailyControlDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  closingStock?: number;

  @IsOptional()
  @IsString()
  observations?: string;
} 