import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FuelControlService } from '../services/fuelControl.service';
import { FuelDailyControl } from '../entities/FuelDailyControl.entity';
import { FuelOutput } from '../entities/FuelOutput.entity';
import { FuelStockMovement } from '../entities/FuelStockMovement.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CreateFuelDailyControlDto } from '../dto/fuelControl/create-fuel-daily-control.dto';
import { UpdateFuelDailyControlDto } from '../dto/fuelControl/update-fuel-daily-control.dto';
import { CreateFuelOutputDto } from '../dto/fuelControl/create-fuel-output.dto';
import { UpdateFuelOutputDto } from '../dto/fuelControl/update-fuel-output.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { FuelDailyControlStatus } from '../common/enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('fuel-control')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FuelControlController {
  constructor(private readonly fuelControlService: FuelControlService) {}

  // Fuel Daily Control Endpoints
  @Post('daily-control')
  @RequirePermissions('create_fuel_control')
  @AuditDescription('Creación de control diario de combustible')
  async createFuelDailyControl(
    @Req() req,
    @Body() createDto: CreateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    return this.fuelControlService.createFuelDailyControl(
      req.user.id,
      createDto
    );
  }

  @Get('daily-control/:id')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Consulta de control diario de combustible')
  async getFuelDailyControl(
    @Param('id') id: number
  ): Promise<FuelDailyControl> {
    return this.fuelControlService.getFuelDailyControl(id);
  }

  @Get('daily-control')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Consulta de controles diarios de combustible')
  async getFuelDailyControls(
    @Query('warehouseId') warehouseId?: number,
    @Query('status') status?: FuelDailyControlStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ data: FuelDailyControl[]; total: number }> {
    return this.fuelControlService.getFuelDailyControls(
      page,
      limit,
      warehouseId,
      status
    );
  }

  @Put('daily-control/:id/close')
  @RequirePermissions('update_fuel_control')
  @AuditDescription('Cierre de control diario de combustible')
  async closeFuelDailyControl(
    @Req() req,
    @Param('id') id: number,
    @Body() updateDto: UpdateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    return this.fuelControlService.closeFuelDailyControl(
      id,
      req.user.id,
      updateDto
    );
  }

  @Post('daily-control/:id/sign')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Firma de control diario de combustible')
  async signFuelDailyControl(
    @Req() req,
    @Param('id') id: number
  ): Promise<FuelDailyControl> {
    return this.fuelControlService.signFuelDailyControl(id, req.user.id);
  }

  // Fuel Output Endpoints
  @Get('outputs')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Consulta de salidas de combustible por control diario')
  async getFuelOutputs(
    @Query('fuelDailyControlId') fuelDailyControlId: number
  ): Promise<FuelOutput[]> {
    return this.fuelControlService.getFuelOutputs(fuelDailyControlId);
  }

  @Post('output')
  @RequirePermissions('create_fuel_control')
  @AuditDescription('Creación de salida de combustible')
  async createFuelOutput(
    @Req() req,
    @Body() createDto: CreateFuelOutputDto
  ): Promise<FuelOutput> {
    return this.fuelControlService.createFuelOutput(req.user.id, createDto);
  }

  @Get('output/:id')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Consulta de salida de combustible')
  async getFuelOutput(@Param('id') id: number): Promise<FuelOutput> {
    return this.fuelControlService.getFuelOutput(id);
  }

  @Put('output/:id')
  @RequirePermissions('update_fuel_control')
  @AuditDescription('Actualización de salida de combustible')
  async updateFuelOutput(
    @Param('id') id: number,
    @Body() updateDto: UpdateFuelOutputDto
  ): Promise<FuelOutput> {
    return this.fuelControlService.updateFuelOutput(id, updateDto);
  }

  @Post('output/:id/image')
  @RequirePermissions('update_fuel_control')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de imagen de salida de combustible')
  async updateImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<FuelOutput> {
    if (!file) {
      throw new Error('No se ha proporcionado ningún archivo');
    }
    return this.fuelControlService.updateImage(id, file);
  }

  @Post('output/:id/sign')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Firma de salida de combustible')
  async signFuelOutput(
    @Req() req,
    @Param('id') id: number
  ): Promise<FuelOutput> {
    return this.fuelControlService.signFuelOutput(id, req.user.id);
  }

  // Stock Movement Endpoints
  @Get('stock-movements')
  @RequirePermissions('view_fuel_control')
  @AuditDescription('Consulta de movimientos de stock de combustible')
  async getStockMovements(
    @Query('warehouseId') warehouseId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ data: FuelStockMovement[]; total: number }> {
    return this.fuelControlService.getStockMovements(warehouseId, page, limit);
  }
}
