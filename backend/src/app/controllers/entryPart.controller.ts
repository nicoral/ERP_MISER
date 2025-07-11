import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EntryPartService } from '../services/entryPart.service';
import { CreateEntryPartDto } from '../dto/entryPart/create-entryPart.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { EntryPart } from '../entities/EntryPart.entity';
import { UpdateEntryPartDto } from '../dto/entryPart/update-entryPart.dto';

@Controller('entry-parts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EntryPartController {
  constructor(private readonly entryPartService: EntryPartService) {}

  @Post()
  @RequirePermissions('create_entry_part')
  @AuditDescription('Creación de parte de ingreso')
  async create(
    @Req() req,
    @Body() createEntryPartDto: CreateEntryPartDto
  ): Promise<EntryPart> {
    return this.entryPartService.create(createEntryPartDto);
  }

  @Post(':id/image')
  @RequirePermissions('update_entry_part')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de imagen de parte de ingreso')
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.entryPartService.updateImage(id, file);
  }

  @Get()
  @RequirePermissions('view_entry_parts')
  @AuditDescription('Consulta de partes de ingreso')
  async findAll() {
    return this.entryPartService.findAll();
  }

  @Get(':id')
  @RequirePermissions('view_entry_parts')
  @AuditDescription('Consulta de detalle de parte de ingreso')
  async findOne(@Param('id') id: number): Promise<EntryPart> {
    return this.entryPartService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_entry_part')
  @AuditDescription('Actualización de parte de ingreso')
  async update(
    @Param('id') id: number,
    @Body() updateEntryPartDto: UpdateEntryPartDto
  ): Promise<EntryPart> {
    return this.entryPartService.update(id, updateEntryPartDto);
  }
}
