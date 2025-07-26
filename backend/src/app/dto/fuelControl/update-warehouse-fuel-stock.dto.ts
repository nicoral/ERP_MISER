import {
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateWarehouseFuelStockDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999.99)
  tankCapacity?: number;
} 