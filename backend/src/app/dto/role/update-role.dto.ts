import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsArray()
  @IsNotEmpty()
  permissions: number[];
}
