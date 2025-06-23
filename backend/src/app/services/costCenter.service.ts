import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { CostCenter } from '../entities/CostCenter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCostCenterDto } from '../dto/costCenter/create-costCenter.dto';
import { UpdateCostCenterDto } from '../dto/costCenter/update-costCenter.dto';

@Injectable()
export class CostCenterService {
  @InjectRepository(CostCenter)
  private readonly costCenterRepository: Repository<CostCenter>;

  async findAllCostCenters(page: number, limit: number, search?: string) {
    const query = this.costCenterRepository.createQueryBuilder('costCenter');
    if (search) {
      query.where('costCenter.name LIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query
      .leftJoinAndSelect('costCenter.children', 'children')
      .where('costCenter.parent IS NULL')
      .orderBy('costCenter.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findOneCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: {
        children: true,
      },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    return costCenter;
  }

  async createCostCenter(createCostCenterDto: CreateCostCenterDto) {
    const { children, ...rest } = createCostCenterDto;
    const costCenter = this.costCenterRepository.create(rest);
    const costCenterSaved = await this.costCenterRepository.save(costCenter);
    const childrenCostCenters = children.map(child => {
      return this.costCenterRepository.create({
        ...child,
        parent: { id: costCenterSaved.id },
      });
    });
    await this.costCenterRepository.save(childrenCostCenters);
    return this.findOneCostCenter(costCenterSaved.id);
  }

  async updateCostCenter(id: number, updateCostCenterDto: UpdateCostCenterDto) {
    const { children, ...rest } = updateCostCenterDto;
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
      relations: {
        children: true,
      },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    let childrenCostCentersIds = costCenter.children.map(child => child.id);
    const costCenterSaved = await this.costCenterRepository.save({
      ...costCenter,
      ...rest,
    });
    for (const child of children) {
      const { id, ...rest } = child;
      if (id) {
        const childCostCenter = await this.findOneCostCenter(id);
        await this.costCenterRepository.update(childCostCenter.id, {
          ...rest,
          parent: { id: costCenterSaved.id },
        });
        childrenCostCentersIds = childrenCostCentersIds.filter(
          id => id !== childCostCenter.id
        );
      } else {
        const childCostCenter = await this.costCenterRepository.create({
          ...rest,
          parent: { id: costCenterSaved.id },
        });
        await this.costCenterRepository.save(childCostCenter);
      }
    }
    if (childrenCostCentersIds && childrenCostCentersIds.length > 0) {
      await this.costCenterRepository.softDelete({
        id: In(childrenCostCentersIds),
      });
    }
    return await this.findOneCostCenter(costCenterSaved.id);
  }

  async deleteCostCenter(id: number) {
    const costCenter = await this.costCenterRepository.findOne({
      where: { id },
    });
    if (!costCenter) {
      throw new NotFoundException('Cost center not found');
    }
    await this.costCenterRepository.softRemove(costCenter);
  }
}
