import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement } from '../entities/Requirement.entity';
import { CreateRequirementDto } from '../dto/requirement/create-requirement.dto';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { UpdateRequirementDto } from '../dto/requirement/update-requirement.dto';
import { Currency, RequirementStatus } from '../common/enum';
import { formatNumber } from '../utils/transformer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    @InjectRepository(RequirementArticle)
    private readonly requirementArticleRepository: Repository<RequirementArticle>
  ) {}

  async create(
    userId: number,
    createRequirementDto: CreateRequirementDto
  ): Promise<Requirement> {
    const { costCenterId, requirementArticles, ...requirementData } =
      createRequirementDto;
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
      currency: article.currency,
    }));

    await this.requirementArticleRepository.save(articles);

    return this.findOne(savedRequirement.id);
  }

  async findAll(
    userId: number,
    page: number,
    limit: number
  ): Promise<{ requirements: Requirement[]; total: number }> {
    const [requirements, total] = await this.requirementRepository.findAndCount(
      {
        where: [{ employee: { id: userId } }, { status: RequirementStatus.PUBLISHED }],
        relations: ['employee', 'costCenter'],
        order: {
          id: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      }
    );
    return { requirements, total };
  }

  async findOne(id: number): Promise<Requirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: [
        'requirementArticles',
        'requirementArticles.article',
        'employee',
        'costCenter',
        'requirementArticles.article.brand',
      ],
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    return requirement;
  }

  async update(
    id: number,
    updateRequirementDto: UpdateRequirementDto
  ): Promise<Requirement> {
    const { costCenterId, requirementArticles, ...requirementData } =
      updateRequirementDto;

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
      costCenter: costCenterId
        ? { id: Number(costCenterId) }
        : requirement.costCenter,
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
        currency: article.currency,
      }));

      await this.requirementArticleRepository.save(articles);
    }

    // Return updated requirement with all relations
    return this.findOne(id);
  }

  async generateRequirementPdf(id: number): Promise<Buffer> {
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/requirement.template.html'),
      'utf8'
    );
    const requirement = await this.findOne(id);
    const { requirementArticles } = requirement;
    const subtotalPEN = requirementArticles
      .filter(reqArticle => reqArticle.currency === Currency.PEN)
      .reduce(
        (acc, reqArticle) => acc + reqArticle.unitPrice * reqArticle.quantity,
        0
      );
    const subtotalUSD = requirementArticles
      .filter(reqArticle => reqArticle.currency === Currency.USD)
      .reduce(
        (acc, reqArticle) => acc + reqArticle.unitPrice * reqArticle.quantity,
        0
      );
    const data = {
      id: requirement.id,
      code: requirement.code,
      employee:
        requirement.employee.firstName + ' ' + requirement.employee.lastName,
      area: requirement.employee.area,
      date: requirement.createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      costCenter: requirement.costCenter.name,
      priority: requirement.priority,
      observation: requirement.observation,
      articles: requirementArticles.map(reqArticle => ({
        articleId: reqArticle.article.id.toString().padStart(5, '0'),
        code: reqArticle.article.code,
        name: reqArticle.article.name,
        unitOfMeasure: reqArticle.article.unitOfMeasure,
        quantity: reqArticle.quantity,
        totalPrice: reqArticle.currency + ' ' + (reqArticle.unitPrice * reqArticle.quantity).toFixed(2),
        brand: reqArticle.article.brand.name,
        justification: reqArticle.justification,
      })),
      subtotalPEN: +(subtotalPEN.toFixed(2)),
      subtotalUSD: +(subtotalUSD.toFixed(2)),
    };
    const template = Handlebars.compile(templateHtml);
    const html = template({ ...data });

    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '5px', right: '5px' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  async publish(id: number, userId: number): Promise<Requirement> {
    const requirement = await this.findOne(id);
    if (requirement.employee.id !== userId) {
      throw new ForbiddenException('No tienes permisos para aprobar este requerimiento');
    }
    requirement.status = RequirementStatus.PUBLISHED;
    return this.requirementRepository.save(requirement);
  }

  async findDistribution(): Promise<{ name: string; value: number }[]> {
    const requirements = await this.requirementRepository.find({
      where: { status: RequirementStatus.PUBLISHED },
      relations: ['requirementArticles'],
    });
    const groupedByMonth = requirements.reduce((acc, requirement) => {
      const month = requirement.createdAt.getMonth();
      const value = requirement.requirementArticles.reduce((acc, article) => {
        return acc + article.unitPrice * article.quantity;
      }, 0);
      acc[month] = (acc[month] || 0) + value;
      return acc;
    }, {});
    return Object.entries(groupedByMonth).map(([month, value]) => ({
      name: new Date(0, Number(month)).toLocaleString('es-ES', { month: 'long' }),
      value: Number(value),
    }));
  }
}
