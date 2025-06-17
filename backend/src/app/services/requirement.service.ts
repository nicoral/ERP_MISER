import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement } from '../entities/Requirement.entity';
import { CreateRequirementDto } from '../dto/requirement/create-requirement.dto';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { UpdateRequirementDto } from '../dto/requirement/update-requirement.dto';
import { RequirementStatus } from '../common/enum';
import { formatNumber } from '../utils/transformer';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    @InjectRepository(RequirementArticle)
    private readonly requirementArticleRepository: Repository<RequirementArticle>,
  ) { }

  async create(userId: number, createRequirementDto: CreateRequirementDto): Promise<Requirement> {
    const { costCenterId, requirementArticles, ...requirementData } = createRequirementDto;
    const requirement = this.requirementRepository.create({
      ...requirementData,
      employee: { id: userId },
      costCenter: { id: Number(costCenterId) },
      status: RequirementStatus.PENDING,
    });
    requirement.code = 'REQ-' + formatNumber(userId);

    const savedRequirement = await this.requirementRepository.save(requirement);
    await this.requirementRepository.update(savedRequirement.id, {
      code: 'REQ-' + formatNumber(savedRequirement.id),
    });
    const articles = requirementArticles.map(article => ({
      requirement: { id: savedRequirement.id },
      article: { id: Number(article.articleId) },
      quantity: Number(article.quantity),
      unitPrice: Number(article.unitPrice),
      justification: article.justification,
    }))

    await this.requirementArticleRepository.save(articles);

    return this.findOne(savedRequirement.id);
  }

  async findAll(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ requirements: Requirement[], total: number }> {
    const [requirements, total] = await this.requirementRepository.findAndCount({
      where: { employee: { id: userId } },
      relations: ['employee', 'costCenter'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { requirements, total };
  }

  async findOne(id: number): Promise<Requirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: ['requirementArticles', 'requirementArticles.article', 'employee', 'costCenter'],
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    return requirement;
  }

  async update(id: number, updateRequirementDto: UpdateRequirementDto): Promise<Requirement> {
    const { costCenterId, requirementArticles, ...requirementData } = updateRequirementDto;

    // Find existing requirement with its articles
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: ['requirementArticles'],
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // Update basic requirement data
    const updatedRequirement = await this.requirementRepository.save({
      ...requirement,
      ...requirementData,
      costCenter: costCenterId ? { id: Number(costCenterId) } : requirement.costCenter,
    });

    if (requirementArticles && requirementArticles.length > 0) {
      // Delete existing requirement articles
      await this.requirementArticleRepository.delete({ requirement: { id } });

      // Create new requirement articles
      const articles = requirementArticles.map(article => ({
        requirement: { id: updatedRequirement.id },
        article: { id: Number(article.articleId) },
        quantity: Number(article.quantity),
        unitPrice: Number(article.unitPrice),
        justification: article.justification,
      }));

      await this.requirementArticleRepository.save(articles);
    }

    // Return updated requirement with all relations
    return this.findOne(id);
  }
}