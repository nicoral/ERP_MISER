import { PartialType } from '@nestjs/mapped-types';
import { CreateCostCenterDto } from './create-costCenter.dto';

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {}
