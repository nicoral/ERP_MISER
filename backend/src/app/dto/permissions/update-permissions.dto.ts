import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdatePermissionsDto {
  @IsArray()
  @IsNotEmpty()
  permissions: number[];
}
