import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from '../entities/Article.entity';
import { ILike, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { Brand } from '../entities/Brand.entity';
import { CreateBrandDto } from '../dto/article/create-brand.dto';
import { Warehouse } from '../entities/Warehouse.entity';
import { ExcelImportService } from './excel-import.service';
import { ImportArticleDto } from '../dto/article/import-article.dto';
import { StorageService } from './storage.service';

export interface ImportArticleResult {
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(WarehouseArticle)
    private readonly warehouseArticleRepository: Repository<WarehouseArticle>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly excelImportService: ExcelImportService,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { brandId, ...rest } = createArticleDto;
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const article = this.articleRepository.create({
      ...rest,
      brand,
    });

    const savedArticle = await this.articleRepository.save(article);
    const warehousesArticles = createArticleDto.warehouseArticles.map(
      warehouseArticle =>
        this.warehouseArticleRepository.create({
          warehouse: { id: warehouseArticle.warehouseId },
          stock: warehouseArticle.stock,
          minStock: warehouseArticle.minStock,
          maxStock: warehouseArticle.maxStock,
          line: warehouseArticle.line,
          shelf: warehouseArticle.shelf,
          article: { id: savedArticle.id },
        })
    );
    await this.warehouseArticleRepository.insert(warehousesArticles);
    return this.findOne(savedArticle.id);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Article[]; total: number }> {
    const query = this.articleRepository.createQueryBuilder('article');
    if (search) {
      query.where('article.code ILIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query
      .leftJoinAndSelect('article.brand', 'brand')
      .leftJoinAndSelect('article.warehouseArticles', 'warehouseArticles')
      .orderBy('article.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async listSimple(search?: string): Promise<Article[]> {
    const query = this.articleRepository.find({
      select: {
        id: true,
        name: true,
        code: true,
        unitOfMeasure: true,
        brand: {
          id: true,
          name: true,
        },
      },
      where: [
        {
          name: ILike(`%${search}%`),
        },
        {
          code: ILike(`%${search}%`),
        },
        {
          brand: {
            name: ILike(`%${search}%`),
          },
        },
        {
          unitOfMeasure: ILike(`%${search}%`),
        },
      ],
      relations: ['brand'],
    });
    return query;
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['brand', 'warehouseArticles', 'warehouseArticles.warehouse'],
      withDeleted: true,
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto
  ): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['warehouseArticles', 'warehouseArticles.warehouse'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    const { brandId, warehouseArticles, ...rest } = updateArticleDto;
    const warehouseArticlesUpdate = warehouseArticles;
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    await this.articleRepository.update(id, {
      ...rest,
      brand,
    });

    if (article.warehouseArticles.length > 0) {
      await this.warehouseArticleRepository.delete({ article: { id } });
    }
    if (warehouseArticlesUpdate && warehouseArticlesUpdate.length > 0) {
      const warehouseArticles = warehouseArticlesUpdate.map(warehouseArticle =>
        this.warehouseArticleRepository.create({
          warehouse: { id: warehouseArticle.warehouseId },
          stock: warehouseArticle.stock,
          minStock: warehouseArticle.minStock,
          maxStock: warehouseArticle.maxStock,
          line: warehouseArticle.line,
          shelf: warehouseArticle.shelf,
          article: { id: article.id },
        })
      );
      await this.warehouseArticleRepository.save(warehouseArticles);
    }
    return this.findOne(id);
  }

  async updateImage(id: number, file: Express.Multer.File): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.imageUrl) {
      await this.storageService.removeFileByUrl(article.imageUrl);
    }
    const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `articles/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype
    );
    article.imageUrl = uploadResult.url;
    return this.articleRepository.save(article);
  }

  async updateTechnicalSheet(id: number, file: Express.Multer.File): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.technicalSheetUrl) {
      await this.storageService.removeFileByUrl(article.technicalSheetUrl);
    }
    const fileName = `${id}-technical-sheet-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `articles/technical-sheets/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype
    );
    article.technicalSheetUrl = uploadResult.url;
    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.articleRepository.softRemove(article);
  }

  async findAllBrands(): Promise<Brand[]> {
    return this.brandRepository.find();
  }

  async createBrand(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File
  ): Promise<Brand> {
    const brand = this.brandRepository.create(createBrandDto);
    if (file) {
      const fileName = `${brand.id}-${Date.now()}.${file.originalname.split('.').pop()}`;
      const path = `brands/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        file.buffer,
        file.mimetype
      );
      brand.imageUrl = uploadResult.url;
    }
    return this.brandRepository.save(brand);
  }

  /**
   * Importa artículos desde un archivo Excel
   */
  async importFromExcel(
    articlesData: ImportArticleDto[]
  ): Promise<ImportArticleResult> {
    const result: ImportArticleResult = {
      success: 0,
      errors: [],
      total: articlesData.length,
    };

    // Cache para marcas y almacenes
    const brandMap = new Map<string, Brand>();
    const warehouseMap = new Map<number, Warehouse>();

    // Cargar marcas y almacenes existentes
    const existingBrands = await this.brandRepository.find();
    existingBrands.forEach(brand => {
      brandMap.set(brand.name.toLowerCase(), brand);
    });

    const existingWarehouses = await this.warehouseRepository.find();
    existingWarehouses.forEach(warehouse => {
      warehouseMap.set(warehouse.id, warehouse);
    });

    // Procesar cada artículo
    for (let i = 0; i < articlesData.length; i++) {
      const articleData = articlesData[i];
      try {
        // Paso 1: Validar datos requeridos
        if (!this.validateArticleData(articleData)) {
          const errorMsg = `Artículo ID ${articleData.id}: Faltan datos requeridos`;
          result.errors.push({ row: i + 2, error: errorMsg });
          continue;
        }

        // Paso 2: Buscar o crear marca
        let brand = brandMap.get(articleData.brandName?.toLowerCase());
        if (!brand && articleData.brandName) {
          brand = this.brandRepository.create({
            name: articleData.brandName,
          });
          brand = await this.brandRepository.save(brand);
          brandMap.set(articleData.brandName.toLowerCase(), brand);
        }

        // Paso 3: Buscar artículo existente o crear nuevo
        let article: Article;
        const existingArticle = await this.articleRepository.findOne({
          where: { id: articleData.id },
          relations: ['warehouseArticles', 'warehouseArticles.warehouse'],
        });

        if (existingArticle) {
          // Actualizar artículo existente
          existingArticle.name = articleData.name;
          existingArticle.code = articleData.code;
          existingArticle.unitOfMeasure = articleData.unitOfMeasure;
          existingArticle.type = articleData.type;
          existingArticle.rotationClassification =
            articleData.rotationClassification;
          existingArticle.active =
            articleData.active !== undefined ? articleData.active : true;
          if (brand) {
            existingArticle.brand = brand;
          }
          article = await this.articleRepository.save(existingArticle);
        } else {
          // Crear artículo con ID específico
          article = await this.forceInsertArticleWithId(articleData, brand?.id);
        }

        // Paso 4: Procesar configuraciones de almacén
        if (
          articleData.warehouseStocks &&
          articleData.warehouseStocks.length > 0
        ) {
          for (const stockData of articleData.warehouseStocks) {
            // Verificar si el almacén existe
            const warehouse = warehouseMap.get(stockData.warehouseId);
            if (!warehouse) {
              const errorMsg = `Artículo ID ${articleData.id}: Almacén "${stockData.warehouseId}" no existe`;
              result.errors.push({ row: i + 2, error: errorMsg });
              continue;
            }

            // Buscar configuración existente o crear nueva
            const existingWarehouseArticle =
              await this.warehouseArticleRepository.findOne({
                where: {
                  article: { id: article.id },
                  warehouse: { id: warehouse.id },
                },
              });

            if (existingWarehouseArticle) {
              // Actualizar configuración existente
              existingWarehouseArticle.stock = stockData.stock || 0;
              existingWarehouseArticle.minStock = stockData.minStock || 0;
              existingWarehouseArticle.maxStock = stockData.maxStock || 0;
              existingWarehouseArticle.line = stockData.line || '';
              existingWarehouseArticle.shelf = stockData.shelf || '';
              existingWarehouseArticle.valued = stockData.valued || 0;
              await this.warehouseArticleRepository.save(
                existingWarehouseArticle
              );
            } else {
              // Crear nueva configuración
              const warehouseArticle = this.warehouseArticleRepository.create({
                article: { id: article.id },
                warehouse: { id: warehouse.id },
                stock: stockData.stock || 0,
                minStock: stockData.minStock || 0,
                maxStock: stockData.maxStock || 0,
                line: stockData.line || '',
                shelf: stockData.shelf || '',
                valued: stockData.valued || 0,
              });
              await this.warehouseArticleRepository.save(warehouseArticle);
            }
          }
        }

        result.success++;
      } catch (error) {
        const errorMsg = `Artículo ID ${articleData.id}: ${error.message}`;
        result.errors.push({ row: i + 2, error: errorMsg });
      }
    }

    return result;
  }

  /**
   * Valida que el artículo tenga todos los datos requeridos
   */
  private validateArticleData(articleData: ImportArticleDto): boolean {
    return !!(
      articleData.id &&
      articleData.name &&
      articleData.code &&
      articleData.unitOfMeasure &&
      articleData.type &&
      articleData.rotationClassification &&
      articleData.brandName
    );
  }

  /**
   * Fuerza la inserción de un artículo con ID específico y reinicia la secuencia
   */
  private async forceInsertArticleWithId(
    articleData: ImportArticleDto,
    brandId?: number
  ): Promise<Article> {
    try {
      // Forzar inserción con ID específico
      const insertQuery = `
        INSERT INTO article (
          id, name, code, unit_of_measure, type, 
          rotation_classification, active, brand_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await this.dataSource.query(insertQuery, [
        articleData.id,
        articleData.name,
        articleData.code,
        articleData.unitOfMeasure,
        articleData.type,
        articleData.rotationClassification,
        articleData.active !== undefined ? articleData.active : true,
        brandId || null,
        new Date(),
        new Date(),
      ]);

      // Reiniciar la secuencia
      await this.dataSource.query(`
        SELECT setval('article_id_seq', (SELECT MAX(id) FROM article));
      `);

      // Retornar el artículo creado
      const article = await this.findOne(articleData.id!);
      return article;
    } catch (error) {
      console.error(`FORCE INSERT - ERROR: ${error.message}`);
      console.error(`FORCE INSERT - Stack trace: ${error.stack}`);
      throw error;
    }
  }

  async generateImportTemplate(): Promise<Buffer> {
    return this.excelImportService.generateArticleTemplate();
  }
}
