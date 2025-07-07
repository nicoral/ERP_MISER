import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/Service.entity';
import { CreateServiceDto } from '../dto/service/create-service.dto';
import { UpdateServiceDto } from '../dto/service/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Service[]; total: number }> {
    const query = this.serviceRepository.createQueryBuilder('service');
    if (search) {
      query.where('service.code ILIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query
      .orderBy('service.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto
  ): Promise<Service> {
    const service = await this.findOne(id);
    this.serviceRepository.merge(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.serviceRepository.softDelete(id);
  }
}
