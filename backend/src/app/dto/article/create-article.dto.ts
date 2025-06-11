import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  unitOfMeasure: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  line: string;

  @IsNotEmpty()
  shelf: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  rotationClassification: string;

  @IsNotEmpty()
  minStock: number;

  @IsNotEmpty()
  maxStock: number;

  @IsNotEmpty()
  reorderQuantity: number;

  @IsOptional()
  imageUrl: string;

  @IsOptional()
  active: boolean;
}