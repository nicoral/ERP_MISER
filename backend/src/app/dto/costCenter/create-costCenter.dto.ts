import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCostCenterDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  serial: string;

  @IsOptional()
  @IsString()
  codeMine: string;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  owner: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCostCenterChildrenDto)
  children: CreateCostCenterChildrenDto[];
}

export class CreateCostCenterChildrenDto extends OmitType(CreateCostCenterDto, [
  'children',
]) {}
