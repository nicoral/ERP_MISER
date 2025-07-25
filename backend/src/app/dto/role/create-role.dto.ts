import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsArray()
  @IsNotEmpty()
  permissions: number[];
}
