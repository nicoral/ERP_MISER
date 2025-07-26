import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateFuelOutputDto {
  @IsNotEmpty()
  @IsNumber()
  fuelDailyControlId: number;

  @IsNotEmpty()
  @IsNumber()
  operatorEmployeeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  costCenterId: number;

  @IsNotEmpty()
  @IsNumber()
  hourMeter: number;
} 