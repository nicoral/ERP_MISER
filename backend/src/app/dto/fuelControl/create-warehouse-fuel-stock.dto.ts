import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateWarehouseFuelStockDto {
  @IsNotEmpty()
  @IsNumber()
  warehouseId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentStock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minStock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxStock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tankCapacity: number;
}
