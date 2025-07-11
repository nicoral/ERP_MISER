import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { CostCenterService } from '../services/costCenter.service';
import { CreateCostCenterDto } from '../dto/costCenter/create-costCenter.dto';
import { UpdateCostCenterDto } from '../dto/costCenter/update-costCenter.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('cost-centers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CostCenterController {
  constructor(private readonly costCenterService: CostCenterService) {}

  @Get()
  @RequirePermissions('view_cost_centers')
  @AuditDescription('Consulta de lista de centros de costo')
  async findAllCostCenters(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string
  ) {
    return this.costCenterService.findAllCostCenters(page, limit, search);
  }

  @Get(':id')
  @RequirePermissions('view_cost_centers')
  @AuditDescription('Consulta de centro de costo')
  async findOneCostCenter(@Param('id') id: number) {
    return this.costCenterService.findOneCostCenter(id);
  }

  @Post()
  @RequirePermissions('create_cost_centers')
  @AuditDescription('Creación de nuevo centro de costo')
  async createCostCenter(@Body() createCostCenterDto: CreateCostCenterDto) {
    return this.costCenterService.createCostCenter(createCostCenterDto);
  }

  @Put(':id')
  @RequirePermissions('update_cost_centers')
  @AuditDescription('Actualización de centro de costo')
  async updateCostCenter(
    @Param('id') id: number,
    @Body() updateCostCenterDto: UpdateCostCenterDto
  ) {
    return this.costCenterService.updateCostCenter(id, updateCostCenterDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_cost_centers')
  @AuditDescription('Eliminación de centro de costo')
  async deleteCostCenter(@Param('id') id: number) {
    return this.costCenterService.deleteCostCenter(id);
  }

  @Post('excel/import')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions('create_cost_centers')
  @AuditDescription('Importación de equipos desde Excel')
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const result = await this.costCenterService.importFromExcel(file);
    return {
      message: `Importación completada. ${result.success} equipos importados exitosamente.`,
      ...result,
    };
  }

  @Get('excel/template')
  @RequirePermissions('create_cost_centers')
  @AuditDescription('Descarga de template para importación de equipos')
  async downloadTemplate(@Res() res: Response) {
    const template = this.costCenterService.generateCostCenterTemplate();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-equipos.xlsx"',
      'Content-Length': template.length,
    });

    res.end(template);
  }
}
