import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExitPart } from '../entities/ExitPart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExitPartArticle } from '../entities/ExitPartArticle.entity';
import { CreateExitPartDto } from '../dto/exitPart/create-exitPart.dto';
import { ExitPartStatus, ExitPartType } from '../common/enum';
import { Article } from '../entities/Article.entity';
import { StorageService } from './storage.service';
import { formatNumber } from '../utils/transformer';
import { Service } from '../entities/Service.entity';
import { ExitPartService as ExitPartServiceEntity } from '../entities/ExitPartService.entity';

@Injectable()
export class ExitPartService {
  constructor(
    @InjectRepository(ExitPart)
    private readonly exitPartRepository: Repository<ExitPart>,
    @InjectRepository(ExitPartArticle)
    private readonly exitPartArticleRepository: Repository<ExitPartArticle>,
    @InjectRepository(ExitPartService)
    private readonly exitPartServiceRepository: Repository<ExitPartService>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource
  ) { }

  async findAll(
    page: number,
    limit: number,
    type: ExitPartType
  ): Promise<{ data: ExitPart[]; total: number }> {
    const [exitParts, total] = await this.exitPartRepository.findAndCount({
      relations: {
        employee: true,
        purchaseOrder: true,
        warehouse: true,
      },
      order: {
        createdAt: 'DESC',
      },
      where: {
        type,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: exitParts, total };
  }

  async findOne(id: number): Promise<ExitPart> {
    const exitPart = await this.exitPartRepository.findOne({
      where: { id },
      relations: {
        employee: true,
        purchaseOrder: true,
        warehouse: true,
        exitPartArticles: {
          article: true,
        },
      },
    });

    if (!exitPart) {
      throw new NotFoundException(`Exit part with id ${id} not found`);
    }

    return exitPart;
  }

  async createExitPart(exitPart: CreateExitPartDto): Promise<ExitPart> {
    const { exitPartArticles, exitPartServices, ...exitPartData } = exitPart;

    // Usar transacción para asegurar atomicidad
    return await this.dataSource.transaction(async manager => {
      const generatedCode = await this.generateExitPartCode(
        exitPartData.warehouseId
      );

      const newExitPart = manager.create(ExitPart, {
        code: generatedCode,
        observation: exitPartData.observation,
        exitDate: new Date(exitPartData.exitDate),
        status: ExitPartStatus.COMPLETED,
        imageUrl: exitPartData.imageUrl,
        purchaseOrder: exitPartData.purchaseOrderId
          ? { id: exitPartData.purchaseOrderId }
          : undefined,
        warehouse: exitPartData.warehouseId
          ? { id: exitPartData.warehouseId }
          : undefined,
        employee: exitPartData.employeeId
          ? { id: exitPartData.employeeId }
          : undefined,
      });

      const savedExitPart = await manager.save(ExitPart, newExitPart);

      const newExitPartArticles = await Promise.all(
        exitPartArticles.map(async article => {
          const articleEntity = await manager.findOne(Article, {
            where: { id: article.articleId },
            relations: {
              warehouseArticles: {
                warehouse: true,
              },
            },
          });

          if (!articleEntity) {
            throw new NotFoundException(`Artículo no encontrado`);
          }

          const warehouseArticle = articleEntity.warehouseArticles.find(
            wa => wa.warehouse.id === exitPartData.warehouseId
          );

          if (!warehouseArticle) {
            throw new NotFoundException(`Artículo no encontrado en el almacén`);
          } else if (warehouseArticle.stock < article.delivered) {
            throw new BadRequestException(
              `Cantidad entregada es mayor a la cantidad en el almacén`
            );
          }

          return manager.create(ExitPartArticle, {
            code: article.code,
            name: article.name,
            unit: article.unit,
            quantity: article.quantity,
            delivered: article.delivered,
            conform: article.conform ?? false,
            qualityCert: article.qualityCert ?? false,
            guide: article.guide ?? false,
            inspection: article.inspection,
            observation: article.observation,
            exitPart: savedExitPart,
            article: articleEntity,
          });
        })
      );

      await manager.save(ExitPartArticle, newExitPartArticles);

      const newExitPartServices = await Promise.all(
        exitPartServices.map(async service => {
          const serviceEntity = await manager.findOne(Service, {
            where: { id: service.serviceId },
          });

          if (!serviceEntity) {
            throw new NotFoundException(`Servicio no encontrado`);
          }

          return manager.create(ExitPartServiceEntity, {
            code: service.code,
            name: service.name,
            duration: service.duration,
            received: service.received,
            inspection: service.inspection,
            observation: service.observation,
            exitPart: savedExitPart,
            service: serviceEntity,
          });
        })
      );

      await manager.save(ExitPartServiceEntity, newExitPartServices);

      return savedExitPart;
    });
  }

  private async generateExitPartCode(warehouseId: number): Promise<string> {
    // Obtener el último código generado
    const lastExitPart = await this.exitPartRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });

    let nextNumber = 1;
    if (lastExitPart?.id) {
      // Extraer el número del último código (formato: PI-001, PI-002, etc.)
      nextNumber = +lastExitPart.id + 1;
    }

    // Generar el nuevo código con formato PI-XXX
    return `${formatNumber(warehouseId, 4)}-${formatNumber(nextNumber, 10)}`;
  }

  async updateImage(id: number, file: Express.Multer.File): Promise<ExitPart> {
    const exitPart = await this.findOne(id);
    if (exitPart.imageUrl) {
      await this.storageService.removeFileByUrl(exitPart.imageUrl);
    }
    const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `exit-parts/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype
    );
    exitPart.imageUrl = uploadResult.url;
    return this.exitPartRepository.save(exitPart);
  }
}
