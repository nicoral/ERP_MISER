import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/Warehouse.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>
  ) {}

  async createWarehouse(warehouse: CreateWarehouseDto): Promise<Warehouse> {
    const warehouseEntity = this.warehouseRepository.create({
      ...warehouse,
      manager: { id: warehouse.employeeId },
    });
    return this.warehouseRepository.save(warehouseEntity);
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
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
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
      updateData
    );
    if (updatedWarehouse.affected === 0) {
      throw new NotFoundException('Warehouse not found');
    }
    return this.getWarehouseById(id);
  }

  async deleteWarehouse(id: number): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Warehouse not found');
    }
  }
}
