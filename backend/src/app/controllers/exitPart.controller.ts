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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { ExitPartService } from '../services/exitPart.service';
import { CreateExitPartDto } from '../dto/exitPart/create-exitPart.dto';
import { ExitPart } from '../entities/ExitPart.entity';

@Controller('exit-parts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExitPartController {
  constructor(private readonly exitPartService: ExitPartService) {}

  @Post()
  @RequirePermissions('create_entry_part')
  @AuditDescription('Creación de parte de ingreso')
  async create(
    @Req() req,
    @Body() createExitPartDto: CreateExitPartDto
  ): Promise<ExitPart> {
    return this.exitPartService.createExitPart(createExitPartDto);
  }

  @Post(':id/image')
  @RequirePermissions('update_entry_part')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de imagen de parte de ingreso')
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.exitPartService.updateImage(id, file);
  }

  @Get()
  @RequirePermissions('view_entry_parts')
  @AuditDescription('Consulta de partes de ingreso')
  async findAll() {
    return this.exitPartService.findAll();
  }

  @Get(':id')
  @RequirePermissions('view_entry_parts')
  @AuditDescription('Consulta de detalle de parte de ingreso')
  async findOne(@Param('id') id: number): Promise<ExitPart> {
    return this.exitPartService.findOne(id);
  }

}
