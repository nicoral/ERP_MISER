import { IsString, IsNumber } from 'class-validator';

export class ApplyTemplateDto {
  @IsString()
  templateName: string;

  @IsNumber()
  entityId: number;
}
