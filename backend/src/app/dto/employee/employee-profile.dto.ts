import { Expose } from 'class-transformer';
import { Role } from '../../entities/Role.entity';
import { Warehouse } from '../../entities/Warehouse.entity';

export class EmployeeProfileDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  documentId: string;

  @Expose()
  documentType: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  area: string;

  @Expose()
  position: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  active: boolean;

  @Expose()
  imageUrl: string;

  @Expose()
  signature: string;

  @Expose()
  role: Role;

  @Expose()
  warehousesAssigned: Warehouse[];
}
