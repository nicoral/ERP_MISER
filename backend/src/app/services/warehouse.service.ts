import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/Warehouse.entity';
import { WarehouseFuelStock } from '../entities/WarehouseFuelStock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';
import { UpdateWarehouseFuelStockDto } from '../dto/fuelControl/update-warehouse-fuel-stock.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseFuelStock)
    private readonly warehouseFuelStockRepository: Repository<WarehouseFuelStock>
  ) {}

  async createWarehouse(warehouse: CreateWarehouseDto): Promise<Warehouse> {
    const warehouseEntity = this.warehouseRepository.create({
      ...warehouse,
      manager: { id: warehouse.employeeId },
    });
    
    const savedWarehouse = await this.warehouseRepository.save(warehouseEntity);

    // Crear automáticamente el stock de combustible por defecto
    const defaultFuelStock = this.warehouseFuelStockRepository.create({
      warehouse: { id: savedWarehouse.id },
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      tankCapacity: 0,
    });

    await this.warehouseFuelStockRepository.save(defaultFuelStock);

    return savedWarehouse;
  }

  async getWarehouses(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Warehouse[]; total: number }> {
    const query = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .leftJoinAndSelect('warehouse.manager', 'manager');
    if (search) {
      query.where('warehouse.name ILIKE :search', { search: `%${search}%` });
    }
    query.orderBy('warehouse.id', 'DESC');
    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async getWarehouseById(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['manager'],
      withDeleted: true,
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Obtener el stock de combustible del almacén
    const fuelStock = await this.warehouseFuelStockRepository.findOne({
      where: { warehouse: { id } },
    });

    // Agregar el stock de combustible al objeto warehouse
    if (fuelStock) {
      warehouse['warehouseFuelStock'] = fuelStock;
    }

    return warehouse;
  }

  async updateWarehouse(
    id: number,
    warehouse: UpdateWarehouseDto
  ): Promise<Warehouse> {
    const updateData = { ...warehouse };
    if (warehouse.employeeId) {
      updateData['manager'] = { id: warehouse.employeeId };
      delete updateData.employeeId;
    }
    const updatedWarehouse = await this.warehouseRepository.update(
      id,
      updateData,
    );
    if (updatedWarehouse.affected === 0) {
      throw new NotFoundException('Warehouse not found');
    }
    return this.getWarehouseById(id);
  }

  async deleteWarehouse(id: number): Promise<void> {
    const warehouse = await this.getWarehouseById(id);
    await this.warehouseRepository.softRemove(warehouse);
  }

  // Fuel Stock Methods
  async getWarehouseFuelStock(warehouseId: number): Promise<WarehouseFuelStock> {
    const fuelStock = await this.warehouseFuelStockRepository.findOne({
      where: { warehouse: { id: warehouseId } },
      relations: ['warehouse'],
    });

    if (!fuelStock) {
      throw new NotFoundException('Fuel stock not found for this warehouse');
    }

    return fuelStock;
  }

  async updateWarehouseFuelStock(
    warehouseId: number,
    updateData: UpdateWarehouseFuelStockDto
  ): Promise<WarehouseFuelStock> {
    const fuelStock = await this.getWarehouseFuelStock(warehouseId);
    
    Object.assign(fuelStock, updateData);
    
    return this.warehouseFuelStockRepository.save(fuelStock);
  }

  async getAllWarehouseFuelStocks(): Promise<WarehouseFuelStock[]> {
    return this.warehouseFuelStockRepository.find({
      relations: ['warehouse'],
    });
  }

  async updateFuelStock(
    warehouseId: number,
    quantity: number,
    type: 'add' | 'subtract'
  ): Promise<WarehouseFuelStock> {
    const fuelStock = await this.getWarehouseFuelStock(warehouseId);
    
    if (type === 'subtract' && fuelStock.currentStock < quantity) {
      throw new BadRequestException('Insufficient fuel stock');
    }

    fuelStock.currentStock = type === 'add' 
      ? fuelStock.currentStock + quantity 
      : fuelStock.currentStock - quantity;

    return this.warehouseFuelStockRepository.save(fuelStock);
  }
}
