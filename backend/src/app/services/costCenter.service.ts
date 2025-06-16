import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CostCenter } from "../entities/CostCenter.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCostCenterDto } from "../dto/costCenter/create-costCenter.dto";
import { UpdateCostCenterDto } from "../dto/costCenter/update-costCenter.dto";

@Injectable()
export class CostCenterService {
  @InjectRepository(CostCenter)
  private readonly costCenterRepository: Repository<CostCenter>;

  async findAllCostCenters(page: number, limit: number, search?: string) {
    const query = this.costCenterRepository.createQueryBuilder('costCenter');
    if (search) {
      query.where('costCenter.name LIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query.orderBy('costCenter.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total };
  }

  async findOneCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({ where: { id } });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    return costCenter;
  }

  async createCostCenter(createCostCenterDto: CreateCostCenterDto) {
    const costCenter = this.costCenterRepository.create(createCostCenterDto);
    return this.costCenterRepository.save(costCenter);
  }

  async updateCostCenter(id: number, updateCostCenterDto: UpdateCostCenterDto) {
    const costCenter = await this.costCenterRepository.findOne({ where: { id } });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    return this.costCenterRepository.save({ ...costCenter, ...updateCostCenterDto });
  }

  async deleteCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({ where: { id } });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    return this.costCenterRepository.delete(id);
  }
}