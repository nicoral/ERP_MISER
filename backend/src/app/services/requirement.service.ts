import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Requirement } from '../entities/Requirement.entity';
import { CreateRequirementDto } from '../dto/requirement/create-requirement.dto';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementService as RequirementServiceEntity } from '../entities/RequirementService.entity';
import { UpdateRequirementDto } from '../dto/requirement/update-requirement.dto';
import {
  Currency,
  RequirementPriority,
  RequirementStatus,
} from '../common/enum';
import { formatNumber } from '../utils/transformer';
import {
  canUserSign,
  processSignature,
  isLowAmount,
} from '../utils/approvalFlow.utils';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { EmployeeService } from './employee.service';
import { RoleService } from './role.service';
import { QuotationService } from './quotation.service';
import { QRService } from './qr.service';
import { forwardRef, Inject } from '@nestjs/common';
import { StorageService } from './storage.service';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    @InjectRepository(RequirementArticle)
    private readonly requirementArticleRepository: Repository<RequirementArticle>,
    @InjectRepository(RequirementServiceEntity)
    private readonly requirementServiceRepository: Repository<RequirementServiceEntity>,
    private readonly employeeService: EmployeeService,
    private readonly roleService: RoleService,
    @Inject(forwardRef(() => QuotationService))
    private readonly quotationService: QuotationService,
    private readonly qrService: QRService,
    private readonly storageService: StorageService
  ) {}

  async create(
    userId: number,
    createRequirementDto: CreateRequirementDto
  ): Promise<Requirement> {
    const {
      costCenterId,
      costCenterSecondaryId,
      warehouseId,
      requirementArticles,
      requirementServices,
      type,
      ...requirementData
    } = createRequirementDto;

    // Determine type based on provided data
    const requirementType =
      type ||
      (requirementServices && requirementServices.length > 0
        ? 'SERVICE'
        : 'ARTICLE');

    const requirement = this.requirementRepository.create({
      ...requirementData,
      type: requirementType,
      employee: { id: userId },
      costCenter: { id: Number(costCenterId) },
      costCenterSecondary: { id: Number(costCenterSecondaryId) },
      warehouse: { id: Number(warehouseId) },
      status: RequirementStatus.PENDING,
    });
    requirement.code =
      formatNumber(warehouseId, 4) + '-' + formatNumber(userId, 10);

    const savedRequirement = await this.requirementRepository.save(requirement);
    await this.requirementRepository.update(savedRequirement.id, {
      code:
        formatNumber(warehouseId, 4) +
        '-' +
        formatNumber(savedRequirement.id, 10),
    });

    // Handle articles if provided
    if (requirementArticles && requirementArticles.length > 0) {
      const articles = requirementArticles.map(article => ({
        requirement: { id: savedRequirement.id },
        article: { id: Number(article.articleId) },
        quantity: Number(article.quantity),
        unitPrice: Number(article.unitPrice),
        justification: article.justification,
        currency: article.currency,
      }));

      await this.requirementArticleRepository.save(articles);
    }

    // Handle services if provided
    if (requirementServices && requirementServices.length > 0) {
      const services = requirementServices.map(service => ({
        requirement: { id: savedRequirement.id },
        service: { id: Number(service.serviceId) },
        unitPrice: Number(service.unitPrice),
        justification: service.justification,
        currency: service.currency,
        durationType: service.durationType,
        duration: service.duration,
      }));

      await this.requirementServiceRepository.save(services);
    }

    return this.findOne(savedRequirement.id);
  }

  async findAll(
    type: 'ARTICLE' | 'SERVICE',
    userId: number,
    page: number,
    limit: number
  ): Promise<{ requirements: Requirement[]; total: number }> {
    const employee = await this.employeeService.findOne(userId);
    const role = await this.roleService.findById(employee.role.id);
    const userPermissions = role.permissions.map(p => p.name);

    let whereConditions:
      | FindOptionsWhere<Requirement>
      | FindOptionsWhere<Requirement>[] = [
      {
        employee: { id: userId },
        type: type,
      },
    ];

    if (userPermissions.includes('requirement-view-all')) {
      whereConditions = { type: type };
    } else if (userPermissions.includes('requirement-view-signed3')) {
      whereConditions = [
        { status: RequirementStatus.SIGNED_3, type: type },
        { status: RequirementStatus.APPROVED, type: type },
        { employee: { id: userId }, type: type },
      ];
    } else if (userPermissions.includes('requirement-view-signed2')) {
      whereConditions = [
        { status: RequirementStatus.SIGNED_2, type: type },
        { status: RequirementStatus.SIGNED_3, type: type },
        { status: RequirementStatus.APPROVED, type: type },
        { employee: { id: userId }, type: type },
      ];
    } else if (userPermissions.includes('requirement-view-signed1')) {
      whereConditions = [
        { status: RequirementStatus.SIGNED_1, type: type },
        { status: RequirementStatus.SIGNED_2, type: type },
        { status: RequirementStatus.SIGNED_3, type: type },
        { status: RequirementStatus.APPROVED, type: type },
        { employee: { id: userId }, type: type },
      ];
    }

    const [requirements, total] = await this.requirementRepository.findAndCount(
      {
        where: whereConditions,
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
        'requirementServices',
        'requirementServices.service',
        'employee',
        'costCenter',
        'requirementArticles.article.brand',
        'costCenterSecondary',
        'warehouse',
      ],
      withDeleted: true,
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
    const {
      costCenterId,
      requirementArticles,
      requirementServices,
      ...requirementData
    } = updateRequirementDto;

    // Find existing requirement with its articles and services
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: ['requirementArticles', 'requirementServices'],
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

    if (updatedRequirement.status === RequirementStatus.REJECTED) {
      await this.requirementRepository.update(id, {
        rejectedReason: null,
        rejectedBy: null,
        rejectedAt: null,
        firstSignature: null,
        firstSignedBy: null,
        firstSignedAt: null,
        secondSignature: null,
        secondSignedBy: null,
        secondSignedAt: null,
        thirdSignature: null,
        thirdSignedBy: null,
        thirdSignedAt: null,
        fourthSignature: null,
        fourthSignedBy: null,
        fourthSignedAt: null,
        status: RequirementStatus.PENDING,
      });
    }

    // Handle articles if provided
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

    // Handle services if provided
    if (requirementServices && requirementServices.length > 0) {
      // Delete existing requirement services
      await this.requirementServiceRepository.delete({ requirement: { id } });

      // Create new requirement services
      const services = requirementServices.map(service => ({
        requirement: { id: updatedRequirement.id },
        service: { id: Number(service.serviceId) },
        unitPrice: Number(service.unitPrice),
        justification: service.justification,
        currency: service.currency,
        durationType: service.durationType,
        duration: service.duration,
      }));

      await this.requirementServiceRepository.save(services);
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
    const { requirementArticles, requirementServices, type } = requirement;

    // Generar QR para el requerimiento
    const qrUrl = this.qrService.generateRequirementURL(id, {
      includeTimestamp: true,
      includeVersion: true,
      version: '1.0',
    });
    const qrDataUrl = await this.qrService.generateQRCode(qrUrl);

    // Mapear datos según el tipo de requerimiento
    interface TableItem {
      index: number;
      id: string;
      code: string;
      name: string;
      quantity: number;
      unit: string;
      justification: string;
      currency: string;
      unitPrice: number;
      total: number;
      brand?: string;
    }

    const tableItems: TableItem[] = [];

    if (type === 'ARTICLE') {
      tableItems.push(
        ...requirementArticles.map((reqArticle, index) => ({
          index: index + 1,
          id: reqArticle.article.id.toString().padStart(6, '0'),
          code: reqArticle.article.code,
          name: reqArticle.article.name,
          quantity: reqArticle.quantity,
          unit: reqArticle.article.unitOfMeasure,
          justification: reqArticle.justification,
          currency: reqArticle.currency,
          unitPrice: reqArticle.unitPrice,
          total: reqArticle.unitPrice * reqArticle.quantity,
          brand: reqArticle.article.brand.name,
        }))
      );
    } else {
      tableItems.push(
        ...requirementServices.map((reqService, index) => ({
          index: index + 1,
          id: reqService.service.code,
          code: '-',
          name: reqService.service.name,
          quantity: reqService.duration || 0,
          unit: reqService.durationType || '-',
          justification: reqService.justification,
          currency: reqService.currency,
          unitPrice: reqService.unitPrice,
          total: reqService.unitPrice,
        }))
      );
    }

    // Calculate totals using mapped data
    const totalPEN = tableItems
      .filter(item => item.currency === Currency.PEN)
      .reduce((sum, item) => sum + +item.total, 0);

    const totalUSD = tableItems
      .filter(item => item.currency === Currency.USD)
      .reduce((sum, item) => sum + +item.total, 0);

    const data = {
      id: '01',
      code: requirement.code,
      type: type === 'SERVICE' ? 'SERVICIO' : 'ARTÍCULO',
      employee:
        requirement.employee.firstName + ' ' + requirement.employee.lastName,
      area: requirement.employee.area,
      date: requirement.createdAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      costCenter: requirement.costCenter.description,
      costCenterSecondary: requirement.costCenterSecondary.description,
      priority:
        requirement.priority === RequirementPriority.HIGH
          ? 'ALTA'
          : requirement.priority === RequirementPriority.MEDIUM
            ? 'MEDIA'
            : 'BAJA',
      observation: requirement.observation,
      items: tableItems.map(item => ({
        index: item.index,
        articleId: item.id,
        code: item.code,
        name: item.name,
        unitOfMeasure: item.unit,
        quantity: item.quantity,
        totalPrice: item.currency + ' ' + (+item.total).toFixed(2),
        brand: item.brand || '-',
        justification: item.justification,
      })),
      subtotalPEN: (+totalPEN).toFixed(2),
      subtotalUSD: (+totalUSD).toFixed(2),
      firstSignature: requirement.firstSignature
        ? (
            await this.storageService.getPrivateFileUrl(
              requirement.firstSignature
            )
          ).url
        : null,
      firstSignedAt: requirement.firstSignedAt
        ? requirement.firstSignedAt.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '',
      secondSignature: requirement.secondSignature
        ? (
            await this.storageService.getPrivateFileUrl(
              requirement.secondSignature
            )
          ).url
        : null,
      secondSignedAt: requirement.secondSignedAt
        ? requirement.secondSignedAt.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '',
      thirdSignature: requirement.thirdSignature
        ? (
            await this.storageService.getPrivateFileUrl(
              requirement.thirdSignature
            )
          ).url
        : null,
      thirdSignedAt: requirement.thirdSignedAt
        ? requirement.thirdSignedAt.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '',
      fourthSignature: requirement.fourthSignature
        ? (
            await this.storageService.getPrivateFileUrl(
              requirement.fourthSignature
            )
          ).url
        : null,
      fourthSignedAt: requirement.fourthSignedAt
        ? requirement.fourthSignedAt.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '',
      qrCode: qrDataUrl, // Agregar QR al template
    };
    const template = Handlebars.compile(templateHtml);
    const html = template({ ...data });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
      throw new ForbiddenException(
        'No tienes permisos para aprobar este requerimiento'
      );
    }
    if (requirement.status !== RequirementStatus.PENDING) {
      throw new ForbiddenException(
        'El requerimiento ya fue publicado o firmado'
      );
    }
    const employee = requirement.employee;
    if (!employee.signature) {
      throw new ForbiddenException('El usuario no tiene firma registrada');
    }
    requirement.firstSignature = employee.signature;
    requirement.firstSignedBy = userId;
    requirement.firstSignedAt = new Date();
    requirement.status = RequirementStatus.SIGNED_1;
    return this.requirementRepository.save(requirement);
  }

  async findDistribution(): Promise<
    { month: string; PEN: number; USD: number }[]
  > {
    const requirements = await this.requirementRepository.find({
      where: { status: RequirementStatus.APPROVED },
      relations: ['requirementArticles', 'requirementServices'],
    });

    const groupedByMonthAndCurrency = requirements.reduce(
      (acc, requirement) => {
        const month = requirement.createdAt.getMonth();
        const monthName = new Date(0, month).toLocaleString('es-ES', {
          month: 'short',
        });

        if (!acc[monthName]) {
          acc[monthName] = { month: monthName, PEN: 0, USD: 0 };
        }

        // Calculate totals for articles
        requirement.requirementArticles.forEach(article => {
          const total = article.unitPrice * article.quantity;
          if (article.currency === Currency.PEN) {
            acc[monthName].PEN += total;
          } else if (article.currency === Currency.USD) {
            acc[monthName].USD += total;
          }
        });

        // Calculate totals for services
        requirement.requirementServices.forEach(service => {
          const total = service.unitPrice;
          if (service.currency === Currency.PEN) {
            acc[monthName].PEN += total;
          } else if (service.currency === Currency.USD) {
            acc[monthName].USD += total;
          }
        });

        return acc;
      },
      {} as Record<string, { month: string; PEN: number; USD: number }>
    );

    const result = Object.values(groupedByMonthAndCurrency);

    const monthOrder = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];
    result.sort((a, b) => {
      const aIndex = monthOrder.indexOf(a.month.toLowerCase());
      const bIndex = monthOrder.indexOf(b.month.toLowerCase());
      return aIndex - bIndex;
    });

    return result;
  }

  async remove(id: number): Promise<void> {
    const requirement = await this.findOne(id);
    if (requirement.status !== RequirementStatus.PENDING) {
      throw new ForbiddenException(
        'No se puede eliminar un requerimiento publicado'
      );
    }
    await this.requirementRepository.softRemove(requirement);
  }

  async reject(
    id: number,
    userId: number,
    reason: string
  ): Promise<Requirement> {
    const requirement = await this.findOne(id);
    if (requirement.status === RequirementStatus.APPROVED) {
      throw new ForbiddenException(
        'No se puede rechazar un requerimiento aprobado'
      );
    }
    requirement.rejectedReason = reason;
    requirement.rejectedBy = userId;
    requirement.rejectedAt = new Date();
    requirement.status = RequirementStatus.REJECTED;
    return this.requirementRepository.save(requirement);
  }

  async sign(id: number, userId: number): Promise<Requirement> {
    const requirement = await this.findOne(id);
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

    // Verificar permisos según el estado del requerimiento
    const { canSign } = canUserSign(
      requirement,
      userPermissions,
      requirement.employee.id,
      userId,
      'requirement'
    );

    if (!canSign) {
      throw new ForbiddenException(
        `No tienes permisos para firmar este requerimiento`
      );
    }

    // Calcular monto total para determinar si es de monto bajo
    const totalAmount = (requirement.requirementArticles || []).reduce(
      (acc, reqArticle) =>
        acc + Number(reqArticle.unitPrice) * Number(reqArticle.quantity),
      0
    );
    const isLowAmountRequirement = isLowAmount(totalAmount);

    // Procesar firma usando utilidades unificadas
    const { updatedEntity, becameApproved } = processSignature(
      requirement,
      userId,
      employee.signature,
      isLowAmountRequirement
    );

    // Actualizar entidad
    Object.assign(requirement, updatedEntity);
    const savedRequirement = await this.requirementRepository.save(requirement);

    // Si el requerimiento fue aprobado, crear cotización automáticamente si no existe
    if (becameApproved) {
      const existingQuotation =
        await this.quotationService.getQuotationRequestByRequirement(
          savedRequirement.id
        );
      if (!existingQuotation) {
        await this.quotationService.createQuotationRequest(null, {
          requirementId: savedRequirement.id,
          // Puedes agregar más campos por defecto si es necesario
        });
      }
    }

    return savedRequirement;
  }

  async uploadInform(id: number, inform: Express.Multer.File): Promise<Requirement> {
    const requirement = await this.findOne(id);
    if (requirement.inform) {
      await this.storageService.removeFileByUrl(requirement.inform);
    }
    const fileName = `${id}-${Date.now()}.${inform.originalname.split('.').pop()}`;
    const path = `requirements/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      inform.buffer,
      inform.mimetype
    );
    requirement.inform = uploadResult.url;
    await this.requirementRepository.save(requirement);
    return { ...requirement, inform: uploadResult.url };
  }
}
