import { IsOptional, IsString } from 'class-validator';

export class UpdateQuotationBasicDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
