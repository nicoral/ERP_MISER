import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentApprovalConfigurationDto {
  @IsString()
  entityType: string;

  @IsNumber()
  entityId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatureConfigurationDto)
  configurations: SignatureConfigurationDto[];
}

export class SignatureConfigurationDto {
  @IsNumber()
  signatureLevel: number;

  @IsString()
  roleName: string;

  @IsBoolean()
  isRequired: boolean;
}
