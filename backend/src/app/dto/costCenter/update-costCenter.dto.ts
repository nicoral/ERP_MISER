import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCostCenterDto } from './create-costCenter.dto';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

export class UpdateCostCenterDto extends PartialType(
  OmitType(CreateCostCenterDto, ['children'])
) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCostCenterChildrenDto)
  children: UpdateCostCenterChildrenDto[];
}

class UpdateCostCenterChildrenDto extends PartialType(
  OmitType(CreateCostCenterDto, ['children'])
) {
  @IsOptional()
  @IsNumber()
  id: number;
}
