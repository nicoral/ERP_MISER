import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelDailyControl } from '../entities/FuelDailyControl.entity';
import { FuelOutput } from '../entities/FuelOutput.entity';
import { FuelStockMovement } from '../entities/FuelStockMovement.entity';
import { WarehouseFuelStock } from '../entities/WarehouseFuelStock.entity';
import { CreateFuelDailyControlDto } from '../dto/fuelControl/create-fuel-daily-control.dto';
import { UpdateFuelDailyControlDto } from '../dto/fuelControl/update-fuel-daily-control.dto';
import { CreateFuelOutputDto } from '../dto/fuelControl/create-fuel-output.dto';
import { UpdateFuelOutputDto } from '../dto/fuelControl/update-fuel-output.dto';
import { FuelDailyControlStatus, FuelOutputStatus, FuelMovementType } from '../common/enum';
import { EmployeeService } from './employee.service';
import { RoleService } from './role.service';
import { canUserSign, processSignature, isLowAmount } from '../utils/approvalFlow.utils';

@Injectable()
export class FuelControlService {
  constructor(
    @InjectRepository(FuelDailyControl)
    private readonly fuelDailyControlRepository: Repository<FuelDailyControl>,
    @InjectRepository(FuelOutput)
    private readonly fuelOutputRepository: Repository<FuelOutput>,
    @InjectRepository(FuelStockMovement)
    private readonly fuelStockMovementRepository: Repository<FuelStockMovement>,
    @InjectRepository(WarehouseFuelStock)
    private readonly warehouseFuelStockRepository: Repository<WarehouseFuelStock>,
    private readonly employeeService: EmployeeService,
    private readonly roleService: RoleService
  ) {}

  // Fuel Daily Control Methods
  async createFuelDailyControl(
    userId: number,
    createDto: CreateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    // Verificar si ya existe un control para este almacén en esta fecha
    const existingControl = await this.fuelDailyControlRepository.findOne({
      where: {
        warehouse: { id: createDto.warehouseId },
        controlDate: new Date(),
      }
    });

    if (existingControl) {
      throw new BadRequestException('Daily control already exists for this warehouse and date');
    }

    // Obtener el stock actual del almacén
    const fuelStock = await this.warehouseFuelStockRepository.findOne({
      where: { warehouse: { id: createDto.warehouseId } }
    });

    if (!fuelStock) {
      throw new BadRequestException('Fuel stock not found for this warehouse');
    }

    const fuelDailyControl = this.fuelDailyControlRepository.create({
      warehouse: { id: createDto.warehouseId },
      controlDate: new Date(),
      status: FuelDailyControlStatus.OPEN,
      openingStock: fuelStock.currentStock, // Usar el stock actual del almacén
      observations: createDto.observations,
    });

    const savedControl = await this.fuelDailyControlRepository.save(fuelDailyControl);

    // Crear movimiento de apertura
    await this.createStockMovement(
      createDto.warehouseId,
      FuelMovementType.OPENING,
      fuelStock.currentStock,
      fuelStock.currentStock,
      userId,
      'Opening stock'
    );

    return savedControl;
  }

  async getFuelDailyControl(id: number): Promise<FuelDailyControl> {
    const control = await this.fuelDailyControlRepository.findOne({
      where: { id },
      relations: ['warehouse', 'fuelOutputs', 'fuelOutputs.registeredByEmployee', 'fuelOutputs.operatorEmployee'],
    });

    if (!control) {
      throw new NotFoundException('Fuel daily control not found');
    }

    return control;
  }

  async getFuelDailyControls(
    warehouseId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FuelDailyControl[]; total: number }> {
    const query = this.fuelDailyControlRepository
      .createQueryBuilder('control')
      .leftJoinAndSelect('control.warehouse', 'warehouse')
      .orderBy('control.controlDate', 'DESC');

    if (warehouseId) {
      query.where('control.warehouse.id = :warehouseId', { warehouseId });
    }

    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async closeFuelDailyControl(
    id: number,
    userId: number,
    updateDto: UpdateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    const control = await this.getFuelDailyControl(id);

    if (control.status !== FuelDailyControlStatus.OPEN) {
      throw new BadRequestException('Control is not in OPEN status');
    }

    control.status = FuelDailyControlStatus.CLOSED;
    if (updateDto.closingStock !== undefined) {
      control.closingStock = updateDto.closingStock;
    }
    if (updateDto.observations) {
      control.observations = updateDto.observations;
    }

    const savedControl = await this.fuelDailyControlRepository.save(control);

    // Crear movimiento de cierre
    if (updateDto.closingStock) {
      await this.createStockMovement(
        control.warehouse.id,
        FuelMovementType.CLOSING,
        0,
        updateDto.closingStock,
        userId,
        'Closing stock'
      );
    }

    return savedControl;
  }

  async signFuelDailyControl(
    id: number,
    userId: number
  ): Promise<FuelDailyControl> {
    const control = await this.getFuelDailyControl(id);
    const employee = await this.employeeService.findOne(userId);

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (!employee.signature) {
      throw new BadRequestException('El usuario no tiene firma registrada');
    }

    // Obtener el rol del empleado con sus permisos
    const role = await this.roleService.findById(employee.role.id);
    const userPermissions = role.permissions.map(p => p.name);
    

    // Verificar permisos según el estado del control
    const { canSign } = canUserSign(
      control,
      userPermissions,
      userPermissions.find(p => p.includes('create_fuel_control')) ? userId : -1, // Usar el warehouse como creador para efectos de permisos
      userId,
      'fuelControl'
    );

    if (!canSign) {
      throw new ForbiddenException(
        'No tienes permisos para firmar este control de combustible'
      );
    }

    // Calcular monto total para determinar si es de monto bajo
    // Para el control de combustible, usamos el total de salidas
    const totalAmount = control.totalOutputs || 0;
    const isLowAmountControl = isLowAmount(totalAmount);

    // Procesar firma usando utilidades unificadas
    const { updatedEntity, newStatus } = processSignature(
      control,
      userId,
      employee.signature,
      isLowAmountControl
    );

    // Actualizar entidad
    Object.assign(control, updatedEntity);
    if (newStatus === 'APPROVED') {
      control.status = FuelDailyControlStatus.FINALIZED;
    }
    const savedControl = await this.fuelDailyControlRepository.save(control);

    return savedControl;
  }

  // Fuel Output Methods
  async createFuelOutput(
    userId: number,
    createDto: CreateFuelOutputDto
  ): Promise<FuelOutput> {
    const dailyControl = await this.getFuelDailyControl(createDto.fuelDailyControlId);

    if (dailyControl.status !== FuelDailyControlStatus.OPEN) {
      throw new BadRequestException('Daily control is not open');
    }

    // Verificar stock disponible
    const fuelStock = await this.warehouseFuelStockRepository.findOne({
      where: { warehouse: { id: dailyControl.warehouse.id } }
    });

    if (!fuelStock || fuelStock.currentStock < createDto.quantity) {
      throw new BadRequestException('Insufficient fuel stock');
    }

    const fuelOutput = this.fuelOutputRepository.create({
      quantity: createDto.quantity,
      hourMeter: createDto.hourMeter,
      costCenter: { id: createDto.costCenterId },
      fuelDailyControl: { id: createDto.fuelDailyControlId },
      registeredByEmployee: { id: userId },
      operatorEmployee: { id: createDto.operatorEmployeeId },
      outputTime: new Date().toLocaleTimeString('es-CO', { 
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      status: FuelOutputStatus.PENDING,
    });

    const savedOutput = await this.fuelOutputRepository.save(fuelOutput);

    // Actualizar stock
    await this.warehouseFuelStockRepository.update(fuelStock.id, 
      { currentStock: fuelStock.currentStock - createDto.quantity });

    // Actualizar total de salidas del control diario
    await this.fuelDailyControlRepository.update(dailyControl.id, 
      { totalOutputs: dailyControl.totalOutputs + createDto.quantity });

    // Crear movimiento de salida
    await this.createStockMovement(
      dailyControl.warehouse.id,
      FuelMovementType.OUTPUT,
      fuelStock.currentStock + createDto.quantity,
      fuelStock.currentStock,
      userId,
      `Fuel output: ${createDto.quantity}`
    );

    return savedOutput;
  }

  async getFuelOutput(id: number): Promise<FuelOutput> {
    const output = await this.fuelOutputRepository.findOne({
      where: { id },
      relations: ['registeredByEmployee', 'operatorEmployee', 'costCenter'],
    });

    if (!output) {
      throw new NotFoundException('Fuel output not found');
    }

    return output;
  }

  async getFuelOutputs(fuelDailyControlId: number): Promise<FuelOutput[]> {
    const outputs = await this.fuelOutputRepository.find({
      where: { fuelDailyControl: { id: fuelDailyControlId } },
      relations: ['registeredByEmployee', 'operatorEmployee', 'costCenter'],
      order: { outputTime: 'ASC' },
    });

    return outputs;
  }

  async updateFuelOutput(
    id: number,
    updateDto: UpdateFuelOutputDto
  ): Promise<FuelOutput> {
    const output = await this.getFuelOutput(id);

    if (output.status !== FuelOutputStatus.PENDING) {
      throw new BadRequestException('Output is not in PENDING status');
    }

    Object.assign(output, updateDto);
    return this.fuelOutputRepository.save(output);
  }

  async signFuelOutput(
    id: number,
    userId: number
  ): Promise<FuelOutput> {
    const output = await this.getFuelOutput(id);

    if (output.status !== FuelOutputStatus.PENDING) {
      throw new BadRequestException('Output is not in PENDING status');
    }

    if (output.operatorEmployee.id !== userId) {
      throw new BadRequestException('You are not the operator of this output');
    }

    if (output.operatorEmployee.signature === null) {
      throw new BadRequestException('Operator has no signature');
    }

    await this.fuelOutputRepository.update(id, {
      status: FuelOutputStatus.SIGNED,
      firstSignedBy: userId,
      firstSignedAt: new Date(),
      firstSignature: output.operatorEmployee.signature,
    });

    return this.getFuelOutput(id);
  }

  // Stock Movement Methods
  async createStockMovement(
    warehouseId: number,
    movementType: FuelMovementType,
    stockBefore: number,
    stockAfter: number,
    employeeId: number,
    observations?: string
  ): Promise<FuelStockMovement> {
    const movement = this.fuelStockMovementRepository.create({
      warehouse: { id: warehouseId },
      movementType,
      quantity: Math.abs(stockAfter - stockBefore),
      stockBefore,
      stockAfter,
      employee: { id: employeeId },
      observations,
      movementDate: new Date(),
    });

    return this.fuelStockMovementRepository.save(movement);
  }

  async getStockMovements(
    warehouseId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FuelStockMovement[]; total: number }> {
    const query = this.fuelStockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.employee', 'employee')
      .orderBy('movement.movementDate', 'DESC');

    if (warehouseId) {
      query.where('movement.warehouse.id = :warehouseId', { warehouseId });
    }

    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
} 