import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntryPart } from '../entities/EntryPart.entity';
import { EntryPartArticle } from '../entities/EntryPartArticle.entity';
import { Article } from '../entities/Article.entity';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { CreateEntryPartDto } from '../dto/entryPart/create-entryPart.dto';
import { EntryPartStatus, InspectionStatus } from '../common/enum';
import { UpdateEntryPartDto } from '../dto/entryPart/update-entryPart.dto';
import { Employee } from '../entities/Employee.entity';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { QRService } from './qr.service';

@Injectable()
export class EntryPartService {
  constructor(
    @InjectRepository(EntryPart)
    private readonly entryPartRepository: Repository<EntryPart>,
    @InjectRepository(EntryPartArticle)
    private readonly entryPartArticleRepository: Repository<EntryPartArticle>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(WarehouseArticle)
    private readonly warehouseArticleRepository: Repository<WarehouseArticle>,
    private readonly storageService: StorageService,
    private readonly qrService: QRService
  ) {}

  async create(
    createEntryPartDto: CreateEntryPartDto,
    status = EntryPartStatus.COMPLETED
  ): Promise<EntryPart> {
    const { entryPartArticles: articlesData, ...entryPartData } =
      createEntryPartDto;

    // Generar código automáticamente si no se proporciona
    const generatedCode =
      entryPartData.code || (await this.generateEntryPartCode());

    // Crear la entrada de partes
    const entryPart = this.entryPartRepository.create({
      warehouse: createEntryPartDto.warehouseId
        ? { id: createEntryPartDto.warehouseId }
        : undefined,
      code: generatedCode,
      imageUrl: entryPartData.imageUrl,
      observation: entryPartData.observation,
      entryDate: new Date(createEntryPartDto.entryDate),
      purchaseOrder: createEntryPartDto.purchaseOrderId
        ? { id: createEntryPartDto.purchaseOrderId }
        : undefined,
      employee: createEntryPartDto.employeeId
        ? { id: createEntryPartDto.employeeId }
        : undefined,
      status,
    });

    const savedEntryPart = await this.entryPartRepository.save(entryPart);

    // Crear los artículos de entrada
    const articlesToSave = await Promise.all(
      articlesData.map(async articleDto => {
        // Verificar que el artículo existe
        const article = await this.articleRepository.findOne({
          where: { id: articleDto.articleId },
        });
        if (!article) {
          throw new NotFoundException(
            `Article with id ${articleDto.articleId} not found`
          );
        }

        return this.entryPartArticleRepository.create({
          code: articleDto.code,
          name: articleDto.name,
          unit: articleDto.unit,
          quantity: articleDto.quantity,
          received: articleDto.received,
          conform: articleDto.conform ?? false,
          qualityCert: articleDto.qualityCert ?? false,
          guide: articleDto.guide ?? false,
          inspection: articleDto.inspection,
          observation: articleDto.observation,
          entryPart: savedEntryPart,
          article,
        });
      })
    );

    await this.entryPartArticleRepository.save(articlesToSave);

    // Si el status es COMPLETED, actualizar los stocks
    if (status === EntryPartStatus.COMPLETED) {
      this.updateWarehouseStocks(savedEntryPart.id);
    }

    // Retornar la entrada con sus artículos
    return this.findOne(savedEntryPart.id);
  }

  async findAll(): Promise<EntryPart[]> {
    return this.entryPartRepository.find({
      relations: {
        employee: true,
        purchaseOrder: true,
        warehouse: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<EntryPart> {
    const entryPart = await this.entryPartRepository.findOne({
      where: { id },
      relations: {
        employee: true,
        purchaseOrder: {
          supplier: true,
        },
        warehouse: true,
        entryPartArticles: {
          article: true,
        },
      },
    });

    if (!entryPart) {
      throw new NotFoundException(`Entry part with id ${id} not found`);
    }

    return entryPart;
  }

  private async generateEntryPartCode(): Promise<string> {
    // Obtener el último código generado
    const lastEntryPart = await this.entryPartRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    let nextNumber = 1;
    if (lastEntryPart && lastEntryPart.code) {
      // Extraer el número del último código (formato: PI-001, PI-002, etc.)
      const match = lastEntryPart.code.match(/PI-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Generar el nuevo código con formato PI-XXX
    return `PI-${nextNumber.toString().padStart(3, '0')}`;
  }

  async updateImage(id: number, file: Express.Multer.File): Promise<EntryPart> {
    const entryPart = await this.findOne(id);
    if (!entryPart) {
      throw new NotFoundException(`Entry part with id ${id} not found`);
    }

    if (entryPart.imageUrl) {
      await this.storageService.removeFileByUrl(entryPart.imageUrl);
    }

    const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `entry-parts/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype
    );

    // Actualizar la URL de la imagen en la base de datos
    entryPart.imageUrl = uploadResult.url;
    return this.entryPartRepository.save(entryPart);
  }

  async update(
    id: number,
    updateEntryPartDto: UpdateEntryPartDto
  ): Promise<EntryPart> {
    const entryPart = await this.findOne(id);
    if (!entryPart) {
      throw new NotFoundException(`Entry part with id ${id} not found`);
    }

    if (entryPart.status === EntryPartStatus.COMPLETED) {
      throw new BadRequestException(
        'No se puede actualizar una parte de ingreso completada'
      );
    }

    const { entryPartArticles: articlesData, ...entryPartData } =
      updateEntryPartDto;

    entryPart.observation = entryPartData.observation ?? entryPart.observation;
    entryPart.entryDate = entryPartData.entryDate
      ? new Date(entryPartData.entryDate)
      : new Date();
    entryPart.employee = entryPartData.employeeId
      ? ({ id: entryPartData.employeeId } as Employee)
      : entryPart.employee;
    entryPart.status = EntryPartStatus.COMPLETED;

    await this.entryPartRepository.save(entryPart);

    if (articlesData) {
      await Promise.all(
        articlesData.map(async articleDto => {
          const article = await this.entryPartArticleRepository.findOne({
            where: { id: articleDto.articleId, entryPart: { id: id } },
          });
          if (!article) {
            throw new NotFoundException(
              `Article with id ${articleDto.articleId} not found`
            );
          }

          return this.entryPartArticleRepository.update(article.id, {
            code: articleDto.code,
            name: articleDto.name,
            unit: articleDto.unit,
            quantity: articleDto.quantity,
            received: articleDto.received,
            conform: articleDto.conform ?? false,
            qualityCert: articleDto.qualityCert ?? false,
            guide: articleDto.guide ?? false,
            inspection: articleDto.inspection,
            observation: articleDto.observation,
          });
        })
      );
    }

    // Actualizar los stocks cuando se marca como completado
    this.updateWarehouseStocks(id);

    return this.entryPartRepository.save(entryPart);
  }

  /**
   * Actualiza los stocks de los artículos en el almacén cuando se completa una entrada
   */
  private async updateWarehouseStocks(entryPartId: number): Promise<void> {
    const entryPart = await this.entryPartRepository.findOne({
      where: { id: entryPartId },
      relations: {
        entryPartArticles: {
          article: true,
        },
        warehouse: true,
      },
    });

    if (!entryPart || !entryPart.warehouse) {
      throw new NotFoundException('Entry part or warehouse not found');
    }

    // Actualizar stock para cada artículo de la entrada
    for (const entryPartArticle of entryPart.entryPartArticles) {
      const { article, received } = entryPartArticle;

      // Buscar el registro de stock del artículo en el almacén
      let warehouseArticle = await this.warehouseArticleRepository.findOne({
        where: {
          article: { id: article.id },
          warehouse: { id: entryPart.warehouse.id },
        },
      });

      if (warehouseArticle) {
        // Actualizar el stock existente
        warehouseArticle.stock += Number(received);
        await this.warehouseArticleRepository.save(warehouseArticle);
      } else {
        // Crear un nuevo registro de stock si no existe
        warehouseArticle = this.warehouseArticleRepository.create({
          article: { id: article.id },
          warehouse: { id: entryPart.warehouse.id },
          stock: Number(received),
          minStock: 0,
          maxStock: 100,
          line: 'Sin línea',
          shelf: 'Sin estante',
          valued: 0,
        });
        await this.warehouseArticleRepository.save(warehouseArticle);
      }
    }
  }

  async generateReceptionConformityPdf(id: number): Promise<Buffer> {
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/reception-conformity.template.html'),
      'utf8'
    );
    const entryPart = await this.findOne(id);

    // Generar QR para el documento de conformidad
    const qrUrl = this.qrService.generateEntryPartURL(id, {
      includeTimestamp: true,
      includeVersion: true,
      version: '1.0',
    });
    const qrDataUrl = await this.qrService.generateQRCode(qrUrl);

    // Mapear los artículos para la tabla
    const items = entryPart.entryPartArticles.map((entryPartArticle, index) => ({
      index: index + 1,
      description: entryPartArticle.name,
      unit: entryPartArticle.unit,
      orderedQuantity: entryPartArticle.quantity,
      receivedQuantity: entryPartArticle.received,
      isConform: entryPartArticle.conform,
      hasQualityCertificate: entryPartArticle.qualityCert,
      qualityCertificateNA: !entryPartArticle.qualityCert,
      hasDeliveryNote: entryPartArticle.guide,
      deliveryNoteNA: !entryPartArticle.guide,
      isAccepted: entryPartArticle.inspection === InspectionStatus.ACCEPTED,
      isObserved: entryPartArticle.inspection === InspectionStatus.PENDING,
      isRejected: entryPartArticle.inspection === InspectionStatus.REJECTED,
      observations: entryPartArticle.observation || '',
    }));

    const data = {
      // Header data
      revision: '1',
      version: '1',
      date: new Date(entryPart.entryDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      page: '1 de 1',

      // Information section
      receptionDate: new Date(entryPart.entryDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      receivedBy: entryPart.employee 
        ? `${entryPart.employee.firstName} ${entryPart.employee.lastName}`
        : 'No asignado',
      supplier: entryPart.purchaseOrder?.supplier?.businessName || 'No especificado',
      signature: entryPart.employee?.signature 
        ? (await this.storageService.getPrivateFileUrl(entryPart.employee.signature)).url
        : null,
      purchaseOrder: entryPart.purchaseOrder?.code || 'No especificado',

      // Table items
      items: items,

      // Footer
      receivedByName: entryPart.employee 
        ? `${entryPart.employee.lastName} ${entryPart.employee.firstName}`
        : 'No asignado',

      // QR Code
      qrCode: qrDataUrl,
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
      landscape: true,
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '5px', right: '5px' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  async generateEntryPartPdf(id: number): Promise<Buffer> {
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/entry-part.template.html'),
      'utf8'
    );
    const entryPart = await this.findOne(id);

    // Generar QR para el documento de entrada
    const qrUrl = this.qrService.generateEntryPartURL(id, {
      includeTimestamp: true,
      includeVersion: true,
      version: '1.0',
    });
    const qrDataUrl = await this.qrService.generateQRCode(qrUrl);

    // Mapear los artículos para la tabla
    const items = entryPart.entryPartArticles.map((entryPartArticle) => ({
      code: entryPartArticle.article?.id,
      manufacturerCode: entryPartArticle.article?.code || '',
      quantity: entryPartArticle.quantity,
      unit: entryPartArticle.unit,
      pieces: entryPartArticle.received,
      location: '',
      description: entryPartArticle.name,
    }));

    const currentTime = new Date();
    const data = {
      // Header data
      code: entryPart.code,

      // Information section
      date: new Date(entryPart.entryDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      warehouse: entryPart.warehouse?.name || 'No especificado',
      supplier: entryPart.purchaseOrder?.supplier?.businessName || 'No especificado',
      purchaseOrder: entryPart.purchaseOrder?.code || 'No especificado',
      supplierGuide: entryPart.purchaseOrder?.code || 'No especificado',
      transporter: 'MYSER S.A.',

      // Table items
      items: items,

      // Signature
      signature: entryPart.employee?.signature 
        ? (await this.storageService.getPrivateFileUrl(entryPart.employee.signature)).url
        : null,

      // Observations
      observations: entryPart.observation || 'Sin observaciones',

      // Footer
      time: currentTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),

      // QR Code
      qrCode: qrDataUrl,
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
      margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}
