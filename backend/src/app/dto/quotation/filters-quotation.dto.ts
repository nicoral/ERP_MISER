import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuotationRequestStatus } from '../../entities/QuotationRequest.entity';

export class QuotationFiltersDto {
  @IsOptional()
  @IsEnum(QuotationRequestStatus)
  status?: QuotationRequestStatus;

  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @IsString()
  search?: string;
}
