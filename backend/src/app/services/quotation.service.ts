import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull } from 'typeorm';
import {
  QuotationRequest,
  QuotationRequestStatus,
} from '../entities/QuotationRequest.entity';
import {
  QuotationSupplier,
  QuotationSupplierStatus,
} from '../entities/QuotationSupplier.entity';
import { QuotationSupplierArticle } from '../entities/QuotationSupplierArticle.entity';
import {
  SupplierQuotation,
  SupplierQuotationStatus,
} from '../entities/SupplierQuotation.entity';
import {
  SupplierQuotationItem,
  QuotationItemStatus,
} from '../entities/SupplierQuotationItem.entity';
import {
  FinalSelection,
  FinalSelectionStatus,
} from '../entities/FinalSelection.entity';
import { FinalSelectionItem } from '../entities/FinalSelectionItem.entity';
import { RequirementService } from './requirement.service';
import { SupplierService } from './supplier.service';
import { EmployeeService } from './employee.service';
import { CreateQuotationRequestDto } from '../dto/quotation/create-quotation-request.dto';
import { UpdateQuotationRequestDto } from '../dto/quotation/update-quotation-request.dto';
import { formatNumber } from '../utils/transformer';
import { CreateSupplierQuotationDto } from '../dto/quotation/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from '../dto/quotation/update-supplier-quotation.dto';
import { UpdateQuotationOrderDto } from '../dto/quotation/update-quotation-order.dto';
import { SendQuotationOrderDto } from '../dto/quotation/update-quotation-order.dto';
import { CreateFinalSelectionDto } from '../dto/quotation/create-final-selection.dto';
import { UpdateFinalSelectionDto } from '../dto/quotation/update-final-selection.dto';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { arraysAreEqual, compareArraysNumbers } from '../utils/utils';
import { Employee } from '../entities/Employee.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(QuotationRequest)
    private readonly quotationRequestRepository: Repository<QuotationRequest>,
    @InjectRepository(QuotationSupplier)
    private readonly quotationSupplierRepository: Repository<QuotationSupplier>,
    @InjectRepository(QuotationSupplierArticle)
    private readonly quotationSupplierArticleRepository: Repository<QuotationSupplierArticle>,
    @InjectRepository(SupplierQuotation)
    private readonly supplierQuotationRepository: Repository<SupplierQuotation>,
    @InjectRepository(SupplierQuotationItem)
    private readonly supplierQuotationItemRepository: Repository<SupplierQuotationItem>,
    @InjectRepository(FinalSelection)
    private readonly finalSelectionRepository: Repository<FinalSelection>,
    @InjectRepository(FinalSelectionItem)
    private readonly finalSelectionItemRepository: Repository<FinalSelectionItem>,
    @InjectRepository(RequirementArticle)
    private readonly requirementArticleRepository: Repository<RequirementArticle>,
    private readonly requirementService: RequirementService,
    private readonly supplierService: SupplierService,
    private readonly employeeService: EmployeeService
  ) {}

  // ========================================
  // QUOTATION REQUEST CRUD METHODS
  // ========================================

  async createQuotationRequest(
    userId: number | null,
    createQuotationRequestDto: CreateQuotationRequestDto
  ): Promise<QuotationRequest> {
    const {
      requirementId,
      suppliers = [],
      supplierArticles = [],
      ...quotationData
    } = createQuotationRequestDto;

    // Verify requirement exists using service
    await this.requirementService.findOne(requirementId);

    // Create quotation request
    const quotationRequest: Partial<QuotationRequest> =
      this.quotationRequestRepository.create({
        ...quotationData,
        deadline: quotationData.deadline
          ? new Date(quotationData.deadline)
          : undefined,
        requirement: { id: requirementId },
        status: QuotationRequestStatus.DRAFT,
      });
    if (userId) {
      quotationRequest.createdBy = Object.assign(new Employee(), {
        id: userId,
      });
    }

    // Generate code
    quotationRequest.code = `COT-${formatNumber(requirementId, 6)}-${userId ? formatNumber(userId, 6) : '000000'}`;

    const savedQuotationRequest =
      await this.quotationRequestRepository.save(quotationRequest);

    // Update code with actual ID
    await this.quotationRequestRepository.update(savedQuotationRequest.id, {
      code: `COT-${formatNumber(requirementId, 6)}-${formatNumber(savedQuotationRequest.id, 6)}`,
    });

    // Create quotation suppliers if provided
    if (suppliers.length > 0) {
      // Verify all suppliers exist
      for (const supplier of suppliers) {
        await this.supplierService.findOne(supplier.supplierId);
      }

      const quotationSuppliers = suppliers.map(supplier => ({
        quotationRequest: { id: savedQuotationRequest.id },
        supplier: { id: supplier.supplierId },
        status: QuotationSupplierStatus.PENDING,
      }));

      await this.quotationSupplierRepository.save(quotationSuppliers);
    }

    // Create quotation supplier articles if provided
    if (supplierArticles.length > 0) {
      const quotationSupplierArticles = supplierArticles.map(article => ({
        quotationRequest: { id: savedQuotationRequest.id },
        requirementArticle: { id: article.requirementArticleId },
        quantity: article.quantity,
      }));

      await this.quotationSupplierArticleRepository.save(
        quotationSupplierArticles
      );
    }

    // Update progress asynchronously (don't await to avoid blocking)
    this.updateQuotationProgress(savedQuotationRequest.id).catch(error => {
      console.error('Error updating initial progress:', error);
    });

    return this.findOneQuotationRequest(savedQuotationRequest.id);
  }

  async findAllQuotationRequests(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ quotationRequests: QuotationRequest[]; total: number }> {
    const [quotationRequests, total] =
      await this.quotationRequestRepository.findAndCount({
        where: [{ createdBy: { id: userId } }, { createdBy: IsNull() }],
        relations: ['requirement', 'createdBy'],
        order: { id: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return { quotationRequests, total };
  }

  async findOneQuotationRequest(id: number): Promise<QuotationRequest> {
    const quotationRequest = await this.quotationRequestRepository.findOne({
      where: { id },
      relations: [
        'requirement',
        'requirement.requirementArticles',
        'requirement.requirementArticles.article',
        'requirement.employee',
        'requirement.costCenter',
        'createdBy',
        'quotationSuppliers',
        'quotationSuppliers.supplier',
        'quotationSuppliers.quotationSupplierArticles',
        'quotationSuppliers.quotationSupplierArticles.requirementArticle',
        'quotationSuppliers.quotationSupplierArticles.requirementArticle.article',
        'quotationSuppliers.supplierQuotation',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems.requirementArticle',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems.requirementArticle.article',
        'finalSelection',
        'finalSelection.finalSelectionItems',
        'finalSelection.finalSelectionItems.requirementArticle',
        'finalSelection.finalSelectionItems.requirementArticle.article',
        'finalSelection.finalSelectionItems.supplier',
      ],
    });

    if (!quotationRequest) {
      throw new NotFoundException('Quotation request not found');
    }

    return quotationRequest;
  }

  async updateQuotationRequest(
    userId: number,
    id: number,
    updateQuotationRequestDto: UpdateQuotationRequestDto
  ): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(id, [
      'quotationSuppliers',
      'quotationSuppliers.supplier',
    ]);
    if (quotationRequest.createdBy === undefined) {
      await this.quotationRequestRepository.update(id, {
        createdBy: { id: userId },
      });
    }

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot update non-draft quotation request'
      );
    }

    const { suppliers, supplierArticles, ...quotationData } =
      updateQuotationRequestDto;

    // Update basic data
    await this.quotationRequestRepository.update(id, {
      ...quotationData,
      deadline: quotationData.deadline
        ? new Date(quotationData.deadline)
        : quotationRequest.deadline,
    });

    // Update suppliers if provided
    if (suppliers) {
      // Verify all suppliers exist
      for (const supplier of suppliers) {
        await this.supplierService.findOne(supplier.supplierId);
      }

      // Update suppliers using the helper method
      await this.updateQuotationSuppliersWithSoftDelete(id, suppliers);
    }

    // Update articles if provided
    if (supplierArticles) {
      // Get existing quotation suppliers
      const existingQuotationSuppliers =
        await this.quotationSupplierRepository.find({
          where: { quotationRequest: { id } },
        });

      if (existingQuotationSuppliers.length > 0) {
        await this.quotationSupplierArticleRepository.delete({
          quotationSupplier: { quotationRequest: { id } },
        });
        const quotationSupplierArticles = supplierArticles.map(article => ({
          quotationSupplier: { id: existingQuotationSuppliers[0].id },
          requirementArticle: { id: article.requirementArticleId },
          quantity: article.quantity,
        }));
        await this.quotationSupplierArticleRepository.save(
          quotationSupplierArticles
        );
      }
    }

    return this.findOneQuotationRequest(id);
  }

  async activateQuotationRequest(id: number): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(id, [
      'quotationSuppliers',
    ]);

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft quotation requests can be activated'
      );
    }

    if (quotationRequest.quotationSuppliers.length === 0) {
      throw new BadRequestException(
        'Cannot activate quotation request without suppliers'
      );
    }

    await this.quotationRequestRepository.update(id, {
      status: QuotationRequestStatus.ACTIVE,
    });

    return this.findOneQuotationRequest(id);
  }

  async cancelQuotationRequest(id: number): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(id, [
      'quotationSuppliers',
    ]);

    if (quotationRequest.status === QuotationRequestStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot cancel completed quotation request'
      );
    }

    await this.quotationRequestRepository.update(id, {
      status: QuotationRequestStatus.CANCELLED,
    });

    return this.findOneQuotationRequest(id);
  }

  async removeQuotationRequest(id: number): Promise<void> {
    const quotationRequest = await this.getQuotationRequestOrders(id);

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot delete non-draft quotation request'
      );
    }

    await this.quotationRequestRepository.softDelete(id);
  }

  // ========================================
  // SUPPLIER QUOTATION METHODS
  // ========================================

  async createSupplierQuotation(
    createSupplierQuotationDto: CreateSupplierQuotationDto
  ): Promise<SupplierQuotation> {
    const { quotationRequestId, supplierId, notes, items } =
      createSupplierQuotationDto;

    // Verify quotation request exists
    const quotationRequest = await this.getQuotationRequestOrders(
      +quotationRequestId,
      ['quotationSuppliers', 'quotationSuppliers.supplier', 'createdBy']
    );

    // Verify supplier exists in this quotation request
    const quotationSupplier = quotationRequest.quotationSuppliers.find(
      qs => qs.supplier.id === +supplierId
    );
    if (!quotationSupplier) {
      throw new NotFoundException(
        'Supplier not found in this quotation request'
      );
    }

    // Check if supplier already has a quotation
    const existingQuotation = await this.supplierQuotationRepository.findOne({
      where: { quotationSupplier: { id: quotationSupplier.id } },
      relations: [
        'supplierQuotationItems',
        'supplierQuotationItems.requirementArticle',
        'supplierQuotationItems.requirementArticle.article',
      ],
    });

    if (existingQuotation) {
      // Update existing quotation by deleting and recreating items
      await this.supplierQuotationRepository.update(existingQuotation.id, {
        status: SupplierQuotationStatus.DRAFT,
        notes: notes,
      });

      const { eliminated, added, equal } = compareArraysNumbers(
        existingQuotation.supplierQuotationItems.map(
          item => item.requirementArticle.id
        ),
        items.map(item => +item.articleId)
      );

      if (eliminated.length > 0) {
        await this.supplierQuotationItemRepository.delete({
          supplierQuotation: { id: existingQuotation.id },
          requirementArticle: In(eliminated),
        });
      }

      if (equal.length > 0) {
        const updateItems = existingQuotation.supplierQuotationItems.filter(
          item => equal.includes(+item.requirementArticle.id)
        );

        for (const item of updateItems) {
          const newItem = items.find(
            i => i.articleId === item.requirementArticle.id
          );
          if (!newItem) {
            continue;
          }
          await this.supplierQuotationItemRepository.update(item.id, {
            status:
              (newItem.status as QuotationItemStatus) ||
              QuotationItemStatus.NOT_QUOTED,
            quantity: newItem.quantity,
            unitPrice: newItem.unitPrice || 0,
            totalPrice: (newItem.unitPrice || 0) * newItem.quantity,
            currency: newItem.currency,
            deliveryTime: newItem.deliveryTime,
            notes: newItem.notes,
            reasonNotAvailable: newItem.reasonNotAvailable,
          });
        }
      }

      const newItems = items.filter(item => added.includes(+item.articleId));
      // Create new quotation items
      const quotationItems = newItems.map(item => ({
        status:
          (item.status as QuotationItemStatus) ||
          QuotationItemStatus.NOT_QUOTED,
        quantity: item.quantity, // Default quantity
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.unitPrice || 0) * item.quantity,
        currency: item.currency || 'PEN',
        deliveryTime: item.deliveryTime || 0,
        notes: item.notes || '',
        reasonNotAvailable: item.reasonNotAvailable,
        supplierQuotation: { id: existingQuotation.id },
        requirementArticle: { id: +item.articleId },
      }));

      await this.supplierQuotationItemRepository.save(quotationItems);

      // Calculate total amount (only quoted items)
      const totalAmount = items
        .filter(item => item.status === QuotationItemStatus.QUOTED)
        .reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);

      await this.supplierQuotationRepository.update(existingQuotation.id, {
        totalAmount,
      });

      return this.findOneSupplierQuotation(existingQuotation.id);
    }

    // Create supplier quotation
    const supplierQuotation = this.supplierQuotationRepository.create({
      quotationNumber: `${quotationRequest.code}-${formatNumber(+supplierId, 3)}`,
      receivedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      currency: 'PEN',
      notes: notes,
      status: SupplierQuotationStatus.DRAFT,
      quotationSupplier: { id: quotationSupplier.id },
    });

    const savedSupplierQuotation =
      await this.supplierQuotationRepository.save(supplierQuotation);

    // Create quotation items
    const quotationItems = items.map(item => ({
      status:
        (item.status as QuotationItemStatus) || QuotationItemStatus.QUOTED,
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
      totalPrice:
        item.status === QuotationItemStatus.QUOTED
          ? (item.unitPrice || 0) * item.quantity
          : 0,
      currency: item.currency || 'PEN',
      deliveryTime: item.deliveryTime || 0,
      notes: item.notes || '',
      reasonNotAvailable: item.reasonNotAvailable,
      supplierQuotation: { id: savedSupplierQuotation.id },
      requirementArticle: { id: +item.articleId },
    }));

    await this.supplierQuotationItemRepository.save(quotationItems);

    // Calculate total amount (only quoted items)
    const totalAmount = items
      .filter(item => item.status === QuotationItemStatus.QUOTED)
      .reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);

    await this.supplierQuotationRepository.update(savedSupplierQuotation.id, {
      totalAmount,
    });

    return this.findOneSupplierQuotation(savedSupplierQuotation.id);
  }

  async findOneSupplierQuotation(id: number): Promise<SupplierQuotation> {
    const supplierQuotation = await this.supplierQuotationRepository.findOne({
      where: { id },
      relations: [
        'quotationSupplier',
        'quotationSupplier.quotationRequest',
        'quotationSupplier.supplier',
        'supplierQuotationItems',
        'supplierQuotationItems.requirementArticle',
        'supplierQuotationItems.requirementArticle.article',
      ],
    });

    if (!supplierQuotation) {
      throw new NotFoundException('Supplier quotation not found');
    }

    return supplierQuotation;
  }

  async findAllSupplierQuotations(
    quotationRequestId: number
  ): Promise<SupplierQuotation[]> {
    return this.supplierQuotationRepository.find({
      where: {
        quotationSupplier: { quotationRequest: { id: quotationRequestId } },
      },
      relations: [
        'quotationSupplier',
        'quotationSupplier.supplier',
        'supplierQuotationItems',
        'supplierQuotationItems.requirementArticle',
        'supplierQuotationItems.requirementArticle.article',
      ],
    });
  }

  async updateSupplierQuotation(
    id: number,
    updateSupplierQuotationDto: UpdateSupplierQuotationDto
  ): Promise<SupplierQuotation> {
    const { notes, items } = updateSupplierQuotationDto;
    const supplierQuotation = await this.findOneSupplierQuotation(id);

    if (supplierQuotation.status !== SupplierQuotationStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot update non-draft supplier quotation'
      );
    }

    // Update basic data
    await this.supplierQuotationRepository.update(id, {
      notes: notes,
    });

    // Update items if provided
    if (items) {
      await this.supplierQuotationItemRepository.delete({
        supplierQuotation: { id },
      });

      const quotationItems = items.map(item => ({
        status:
          (item.status as QuotationItemStatus) || QuotationItemStatus.QUOTED,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        totalPrice:
          item.status === QuotationItemStatus.QUOTED
            ? (item.unitPrice || 0) * item.quantity
            : 0,
        currency: item.currency,
        deliveryTime: item.deliveryTime || 0,
        notes: item.notes || '',
        reasonNotAvailable: item.reasonNotAvailable,
        supplierQuotation: { id },
        requirementArticle: { id: +item.id },
      }));

      await this.supplierQuotationItemRepository.save(quotationItems);

      // Recalculate total amount
      const totalAmount = items
        .filter(item => item.status === QuotationItemStatus.QUOTED)
        .reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);

      await this.supplierQuotationRepository.update(id, { totalAmount });
    }

    return this.findOneSupplierQuotation(id);
  }

  async submitSupplierQuotation(id: number): Promise<SupplierQuotation> {
    const supplierQuotation = await this.findOneSupplierQuotation(id);

    if (supplierQuotation.status !== SupplierQuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be submitted');
    }

    await this.supplierQuotationRepository.update(id, {
      status: SupplierQuotationStatus.SUBMITTED,
    });

    // Update progress asynchronously after submitting quotation
    const supplierQuotationAfterSubmit =
      await this.supplierQuotationRepository.findOne({
        where: { id },
        relations: ['quotationSupplier', 'quotationSupplier.quotationRequest'],
      });

    if (supplierQuotationAfterSubmit) {
      this.updateQuotationProgress(
        supplierQuotationAfterSubmit.quotationSupplier.quotationRequest.id
      ).catch(error => {
        console.error(
          'Error updating progress after submitting quotation:',
          error
        );
      });
    }

    return this.findOneSupplierQuotation(id);
  }

  // ========================================
  // QUOTATION ORDER METHODS
  // ========================================

  async updateQuotationOrder(
    quotationRequestId: number,
    updateQuotationOrderDto: UpdateQuotationOrderDto
  ): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(
      quotationRequestId,
      [
        'quotationSuppliers',
        'quotationSuppliers.supplier',
        'quotationSuppliers.quotationSupplierArticles',
        'quotationSuppliers.quotationSupplierArticles.requirementArticle',
      ]
    );

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot update non-draft quotation request'
      );
    }

    const { supplierId, orderNumber, terms, selectedArticles } =
      updateQuotationOrderDto;

    // Find the quotation supplier
    const quotationSupplier = quotationRequest.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    if (!quotationSupplier) {
      throw new NotFoundException(
        'Supplier not found in this quotation request'
      );
    }

    // Update quotation supplier
    await this.quotationSupplierRepository.update(quotationSupplier.id, {
      orderNumber: orderNumber || quotationSupplier.orderNumber,
      terms: terms || quotationSupplier.terms,
    });

    // Update articles if provided
    if (selectedArticles && selectedArticles.length > 0) {
      const { quotationSupplierArticles: qSArticles } = quotationSupplier;
      const quotationSupplierArticlesIds = qSArticles.map(
        qsa => qsa.requirementArticle.id
      );
      const selectedArticlesIds = selectedArticles;

      if (arraysAreEqual(quotationSupplierArticlesIds, selectedArticlesIds)) {
        return this.findOneQuotationRequest(quotationRequestId);
      }

      const { eliminated, added } = compareArraysNumbers(
        quotationSupplierArticlesIds,
        selectedArticlesIds
      );

      if (eliminated.length > 0) {
        await this.quotationSupplierArticleRepository.delete({
          quotationSupplier: { id: quotationSupplier.id },
          requirementArticle: In(eliminated),
        });
      }

      if (added.length > 0) {
        await this.quotationSupplierArticleRepository.save(
          added.map(articleId => ({
            quotationSupplier: { id: quotationSupplier.id },
            requirementArticle: { id: articleId },
            quantity: 1,
          }))
        );
      }
    }

    return this.findOneQuotationRequest(quotationRequestId);
  }

  async sendQuotationOrder(
    quotationRequestId: number,
    sendQuotationOrderDto: SendQuotationOrderDto
  ): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(
      quotationRequestId,
      ['quotationSuppliers', 'quotationSuppliers.supplier']
    );

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      return this.findOneQuotationRequest(quotationRequestId);
    }

    const { supplierId, orderNumber, terms } = sendQuotationOrderDto;

    // Find the quotation supplier
    const quotationSupplier = quotationRequest.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    if (!quotationSupplier) {
      throw new NotFoundException(
        'Supplier not found in this quotation request'
      );
    }

    // Update quotation supplier with sent status
    await this.quotationSupplierRepository.update(quotationSupplier.id, {
      orderNumber: orderNumber || quotationSupplier.orderNumber,
      terms: terms || quotationSupplier.terms,
      status: QuotationSupplierStatus.SENT,
      sentAt: new Date(),
    });

    return this.findOneQuotationRequest(quotationRequestId);
  }

  async sendAllQuotationOrders(
    quotationRequestId: number
  ): Promise<QuotationRequest> {
    const quotationSuppliers = await this.quotationSupplierRepository.find({
      where: {
        quotationRequest: { id: quotationRequestId },
        status: QuotationSupplierStatus.PENDING,
      },
    });

    if (quotationSuppliers.length === 0) {
      return await this.findOneQuotationRequest(quotationRequestId);
    }

    await this.quotationSupplierRepository.update(
      quotationSuppliers.map(qs => qs.id),
      {
        status: QuotationSupplierStatus.SENT,
        sentAt: new Date(),
      }
    );

    // Update progress asynchronously after sending orders
    this.updateQuotationProgress(quotationRequestId).catch(error => {
      console.error('Error updating progress after sending orders:', error);
    });

    return await this.findOneQuotationRequest(quotationRequestId);
  }

  async applyGeneralTermsToAll(
    quotationRequestId: number,
    terms: string,
    selectedArticles?: number[]
  ): Promise<QuotationRequest> {
    const quotationRequest = await this.getQuotationRequestOrders(
      quotationRequestId,
      ['quotationSuppliers']
    );

    if (quotationRequest.status !== QuotationRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot update non-draft quotation request'
      );
    }

    // Update all quotation suppliers with the general terms
    for (const quotationSupplier of quotationRequest.quotationSuppliers) {
      await this.quotationSupplierRepository.update(quotationSupplier.id, {
        terms: terms,
      });

      // If selectedArticles is provided, update articles for all suppliers
      if (selectedArticles && selectedArticles.length > 0) {
        // Remove existing articles for this supplier
        await this.quotationSupplierArticleRepository.delete({
          quotationSupplier: { id: quotationSupplier.id },
        });

        // Add selected articles
        const quotationSupplierArticles = selectedArticles.map(articleId => ({
          quotationSupplier: { id: quotationSupplier.id },
          requirementArticle: { id: articleId },
          quantity: 1, // Default quantity, can be updated later
        }));

        await this.quotationSupplierArticleRepository.save(
          quotationSupplierArticles
        );
      }
    }

    return this.findOneQuotationRequest(quotationRequestId);
  }

  // ========================================
  // FINAL SELECTION METHODS
  // ========================================

  async createFinalSelection(
    createFinalSelectionDto: CreateFinalSelectionDto
  ): Promise<FinalSelection> {
    const { quotationRequestId, notes, items } = createFinalSelectionDto;

    // Verify quotation request exists
    const quotationRequest = await this.getQuotationRequestOrders(
      +quotationRequestId,
      ['createdBy']
    );

    // Check if final selection already exists
    const existingFinalSelection = await this.finalSelectionRepository.findOne({
      where: { quotationRequest: { id: +quotationRequestId } },
      relations: ['finalSelectionItems'],
    });

    if (existingFinalSelection) {
      await this.finalSelectionRepository.update(existingFinalSelection.id, {
        notes,
      });
      const finalSelectionItemsId =
        existingFinalSelection.finalSelectionItems.map(item => item.id);
      const itemsIds = items.map(item => +item.articleId);
      const { eliminated, added } = compareArraysNumbers(
        finalSelectionItemsId,
        itemsIds
      );

      if (eliminated.length > 0) {
        await this.finalSelectionItemRepository.delete(
          eliminated.map(id => ({ id }))
        );
      }

      if (added.length > 0) {
        const newItems = items.filter(item => added.includes(+item.articleId));
        const finalSelectionItems = await Promise.all(
          newItems.map(async item => {
            // Get requirement article to get quantity and other details
            const requirementArticle =
              await this.requirementArticleRepository.findOne({
                where: { id: +item.articleId },
                relations: ['article'],
              });

            if (!requirementArticle) {
              throw new BadRequestException(
                `RequirementArticle with id ${item.articleId} not found`
              );
            }

            // Get supplier quotation item to get currency and other details
            const supplierQuotationItem =
              await this.supplierQuotationItemRepository.findOne({
                where: {
                  requirementArticle: { id: +item.articleId },
                  supplierQuotation: {
                    quotationSupplier: {
                      supplier: { id: +item.supplierId },
                      quotationRequest: { id: +quotationRequestId },
                    },
                  },
                },
                relations: ['supplierQuotation'],
              });

            const quantity = requirementArticle.quantity;
            const unitPrice = item.selectedPrice;
            const totalPrice = unitPrice * quantity;
            const currency = supplierQuotationItem?.currency || 'PEN';

            const finalSelectionItemData = {
              finalSelection: { id: existingFinalSelection.id },
              requirementArticle: { id: +item.articleId },
              supplier: { id: +item.supplierId },
              unitPrice,
              totalPrice,
              quantity,
              currency,
              notes: item.notes,
            };

            // Add supplierQuotationItem if found
            if (supplierQuotationItem) {
              finalSelectionItemData['supplierQuotationItem'] = {
                id: supplierQuotationItem.id,
              };
            }

            return finalSelectionItemData;
          })
        );

        await this.finalSelectionItemRepository.save(finalSelectionItems);

        // Update final selection with calculated totals
        await this.finalSelectionRepository.update(existingFinalSelection.id, {
          totalAmount: finalSelectionItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          ),
        });

        // Update progress asynchronously after creating final selection
        this.updateQuotationProgress(+quotationRequestId).catch(error => {
          console.error(
            'Error updating progress after creating final selection:',
            error
          );
        });

        return this.findOneFinalSelection(existingFinalSelection.id);
      }
    }

    // Create final selection
    const finalSelection = this.finalSelectionRepository.create({
      notes,
      quotationRequest: { id: +quotationRequestId },
      createdBy: { id: quotationRequest.createdBy.id },
      status: FinalSelectionStatus.DRAFT,
    });

    const savedFinalSelection =
      await this.finalSelectionRepository.save(finalSelection);

    // Create final selection items with proper calculations
    const finalSelectionItems = await Promise.all(
      items.map(async item => {
        // Get requirement article to get quantity and other details
        const requirementArticle =
          await this.requirementArticleRepository.findOne({
            where: { id: +item.articleId },
            relations: ['article'],
          });

        if (!requirementArticle) {
          throw new BadRequestException(
            `RequirementArticle with id ${item.articleId} not found`
          );
        }

        // Get supplier quotation item to get currency and other details
        const supplierQuotationItem =
          await this.supplierQuotationItemRepository.findOne({
            where: {
              requirementArticle: { id: +item.articleId },
              supplierQuotation: {
                quotationSupplier: {
                  supplier: { id: +item.supplierId },
                  quotationRequest: { id: +quotationRequestId },
                },
              },
            },
            relations: ['supplierQuotation'],
          });

        const quantity = requirementArticle.quantity;
        const unitPrice = item.selectedPrice;
        const totalPrice = unitPrice * quantity;
        const currency = supplierQuotationItem?.currency || 'PEN';

        const finalSelectionItemData = {
          finalSelection: { id: savedFinalSelection.id },
          requirementArticle: { id: +item.articleId },
          supplier: { id: +item.supplierId },
          unitPrice,
          totalPrice,
          quantity,
          currency,
          notes: item.notes,
        };

        // Add supplierQuotationItem if found
        if (supplierQuotationItem) {
          finalSelectionItemData['supplierQuotationItem'] = {
            id: supplierQuotationItem.id,
          };
        }

        return finalSelectionItemData;
      })
    );

    await this.finalSelectionItemRepository.save(finalSelectionItems);

    // Update final selection with calculated totals
    await this.finalSelectionRepository.update(savedFinalSelection.id, {
      totalAmount: finalSelectionItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      ),
    });

    // Update progress asynchronously after creating final selection
    this.updateQuotationProgress(+quotationRequestId).catch(error => {
      console.error(
        'Error updating progress after creating final selection:',
        error
      );
    });

    return this.findOneFinalSelection(savedFinalSelection.id);
  }

  async findFinalSelectionByRequest(
    quotationRequestId: number
  ): Promise<FinalSelection> {
    const finalSelection = await this.finalSelectionRepository.findOne({
      where: { quotationRequest: { id: quotationRequestId } },
      relations: [
        'quotationRequest',
        'createdBy',
        'finalSelectionItems',
        'finalSelectionItems.requirementArticle',
        'finalSelectionItems.requirementArticle.article',
        'finalSelectionItems.supplier',
      ],
    });

    if (!finalSelection) {
      throw new NotFoundException('Final selection not found');
    }

    return finalSelection;
  }

  async findOneFinalSelection(id: number): Promise<FinalSelection> {
    const finalSelection = await this.finalSelectionRepository.findOne({
      where: { id },
      relations: [
        'quotationRequest',
        'createdBy',
        'finalSelectionItems',
        'finalSelectionItems.requirementArticle',
        'finalSelectionItems.requirementArticle.article',
        'finalSelectionItems.supplier',
      ],
    });

    if (!finalSelection) {
      throw new NotFoundException('Final selection not found');
    }

    return finalSelection;
  }

  async updateFinalSelection(
    id: number,
    updateFinalSelectionDto: UpdateFinalSelectionDto
  ): Promise<FinalSelection> {
    await this.findOneFinalSelection(id);

    const { notes, items } = updateFinalSelectionDto;

    // Update basic data
    await this.finalSelectionRepository.update(id, {
      notes,
    });

    // Update items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await this.finalSelectionItemRepository.update(+item.id, {
          unitPrice: item.selectedPrice,
          totalPrice: item.selectedPrice, // This should be calculated
          notes: item.notes,
        });
      }
    }

    return this.findOneFinalSelection(id);
  }

  async approveFinalSelection(id: number): Promise<FinalSelection> {
    const finalSelection = await this.findOneFinalSelection(id);

    // Check if the final selection is in DRAFT status
    if (finalSelection.status !== FinalSelectionStatus.DRAFT) {
      throw new BadRequestException(
        'Only final selections in DRAFT status can be approved'
      );
    }

    // Update status to APPROVED
    await this.finalSelectionRepository.update(id, {
      status: FinalSelectionStatus.APPROVED,
    });

    // Update quotation request status to ACTIVE
    await this.quotationRequestRepository.update(
      finalSelection.quotationRequest.id,
      {
        status: QuotationRequestStatus.ACTIVE,
      }
    );

    return this.findOneFinalSelection(id);
  }

  async removeFinalSelection(id: number): Promise<void> {
    await this.findOneFinalSelection(id);

    // Delete final selection items first
    await this.finalSelectionItemRepository.delete({
      finalSelection: { id },
    });

    // Delete final selection
    await this.finalSelectionRepository.delete(id);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Private method to calculate quotation progress
  private calculateQuotationProgress(
    quotationRequest: QuotationRequest
  ): number {
    const steps = [
      quotationRequest.quotationSuppliers.length > 0, // Step 1: Suppliers selected
      quotationRequest.quotationSuppliers.some(qs => qs.status === 'SENT'), // Step 2: Orders sent
      quotationRequest.quotationSuppliers.some(qs => qs.supplierQuotation), // Step 3: Quotations received
      quotationRequest.quotationSuppliers.some(
        qs => qs.supplierQuotation?.status === 'SUBMITTED'
      ), // Step 4: Quotations compared
      quotationRequest.finalSelection !== null, // Step 5: Final selection made
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / 5) * 100);
  }

  // Private method to update quotation progress asynchronously
  private async updateQuotationProgress(
    quotationRequestId: number
  ): Promise<void> {
    try {
      const quotationRequest = await this.quotationRequestRepository.findOne({
        where: { id: quotationRequestId },
        relations: [
          'quotationSuppliers',
          'quotationSuppliers.supplierQuotation',
          'finalSelection',
        ],
      });

      if (quotationRequest) {
        const progress = this.calculateQuotationProgress(quotationRequest);
        await this.quotationRequestRepository.update(quotationRequestId, {
          progress,
        });
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Error updating quotation progress:', error);
    }
  }

  // Private method to handle supplier updates with soft delete
  private async updateQuotationSuppliersWithSoftDelete(
    quotationRequestId: number,
    suppliers: Array<{ supplierId: number }>
  ): Promise<void> {
    // Get current quotation suppliers
    const currentQuotationSuppliers =
      await this.quotationSupplierRepository.find({
        where: { quotationRequest: { id: quotationRequestId } },
        relations: ['supplier'],
      });

    const newSupplierIds = new Set(suppliers.map(s => s.supplierId));
    const currentSupplierIds = new Set(
      currentQuotationSuppliers.map(qs => qs.supplier.id)
    );

    // Find suppliers to add (new ones)
    const suppliersToAdd = suppliers.filter(
      supplier => !currentSupplierIds.has(supplier.supplierId)
    );

    // Find suppliers to remove (soft delete)
    const suppliersToRemove = currentQuotationSuppliers.filter(
      qs => !newSupplierIds.has(qs.supplier.id)
    );

    // Soft delete suppliers that are no longer needed
    if (suppliersToRemove.length > 0) {
      const supplierIdsToRemove = suppliersToRemove.map(qs => qs.id);
      await this.quotationSupplierRepository.softDelete(supplierIdsToRemove);
    }

    // Add new suppliers
    if (suppliersToAdd.length > 0) {
      const newQuotationSuppliers = suppliersToAdd.map(supplier => ({
        quotationRequest: { id: quotationRequestId },
        supplier: { id: supplier.supplierId },
        status: QuotationSupplierStatus.PENDING,
      }));
      await this.quotationSupplierRepository.save(newQuotationSuppliers);
    }
  }

  // Use this method when you need specific relations for processing/updating
  // This is more efficient than findOneQuotationRequest which loads all relations
  async getQuotationRequestOrders(
    quotationRequestId: number,
    relations: string[] = []
  ): Promise<QuotationRequest> {
    const quotationRequest = await this.quotationRequestRepository.findOne({
      where: { id: quotationRequestId },
      relations: relations,
    });
    if (!quotationRequest) {
      throw new NotFoundException('Quotation request not found');
    }
    return quotationRequest;
  }

  async getQuotationRequestByRequirement(
    requirementId: number
  ): Promise<QuotationRequest | null> {
    return this.quotationRequestRepository.findOne({
      where: { requirement: { id: requirementId } },
      relations: [
        'requirement',
        'requirement.requirementArticles',
        'requirement.requirementArticles.article',
        'createdBy',
        'quotationSuppliers',
        'quotationSuppliers.supplier',
        'quotationSuppliers.quotationSupplierArticles',
        'quotationSuppliers.quotationSupplierArticles.requirementArticle',
        'quotationSuppliers.quotationSupplierArticles.requirementArticle.article',
        'quotationSuppliers.supplierQuotation',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems.requirementArticle',
        'quotationSuppliers.supplierQuotation.supplierQuotationItems.requirementArticle.article',
        'finalSelection',
        'finalSelection.finalSelectionItems',
        'finalSelection.finalSelectionItems.requirementArticle',
        'finalSelection.finalSelectionItems.requirementArticle.article',
      ],
    });
  }

  async generatePurchaseRequestPdf(id: number, supplierId: number): Promise<Buffer> {
    // Buscar la cotización con todas las relaciones necesarias
    const quotation = await this.findOneQuotationRequest(id);
    const { quotationSuppliers } = quotation;
    const supplierQuotation = quotationSuppliers.find(s => s.supplier.id === supplierId);
    if (!supplierQuotation) {
      throw new NotFoundException('Supplier quotation not found');
    }
    
    // Preparar datos para el template
    const data = {
      code: supplierQuotation.orderNumber || '',
      date: quotation.createdAt
        ? quotation.createdAt.toISOString().slice(0, 10).replace(/-/g, '/')
        : '',
      hour: quotation.createdAt
        ? new Date(quotation.createdAt).toLocaleTimeString('es-PE', { hour12: false })
        : '',
      employee: quotation.createdBy
        ? `${quotation.createdBy.firstName} ${quotation.createdBy.lastName}`
        : '',
      costCenter: quotation.requirement?.costCenter?.description || '',
      observation: `Requerimiento N° ${quotation.requirement?.code || ''}`,
      articles: (quotation.requirement?.requirementArticles || []).map(article => ({
        manufacturerCode: article.article?.code || '',
        quantity: article.quantity,
        unit: article.article?.unitOfMeasure || '',
        description: article.article?.name || '',
        brand: article.article?.brand?.name || '',
        unitPrice: (+article.unitPrice).toFixed(2) || '',
      })),
    };

    // Leer y compilar el template
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/purchase-request.template.html'),
      'utf8'
    );
    const template = Handlebars.compile(templateHtml);
    const html = template(data);

    // Generar el PDF con puppeteer
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
}
