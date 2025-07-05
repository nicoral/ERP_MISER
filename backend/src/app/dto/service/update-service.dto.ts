import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './creae-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}