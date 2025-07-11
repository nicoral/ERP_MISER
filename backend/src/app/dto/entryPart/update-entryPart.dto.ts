import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryPartDto } from './create-entryPart.dto';

export class UpdateEntryPartDto extends PartialType(CreateEntryPartDto) {}
