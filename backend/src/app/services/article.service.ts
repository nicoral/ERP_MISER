import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from '../entities/Article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { Brand } from '../entities/Brand.entity';
import { CreateBrandDto } from '../dto/article/create-brand.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(WarehouseArticle)
    private readonly warehouseArticleRepository: Repository<WarehouseArticle>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
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
      (warehouseArticle) =>
        this.warehouseArticleRepository.create({
          warehouse: { id: warehouseArticle.warehouseId },
          stock: warehouseArticle.stock,
          article: { id: savedArticle.id },
        }),
    );
    await this.warehouseArticleRepository.insert(warehousesArticles);
    return this.findOne(savedArticle.id);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Article[]; total: number }> {
    const query = this.articleRepository.createQueryBuilder('article');
    if (search) {
      query.where('article.name LIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query
      .leftJoinAndSelect('article.brand', 'brand')
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['brand', 'warehouseArticles', 'warehouseArticles.warehouse'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
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
      const warehouseArticles = warehouseArticlesUpdate.map(
        (warehouseArticle) =>
          this.warehouseArticleRepository.create({
            warehouse: { id: warehouseArticle.warehouseId },
            stock: warehouseArticle.stock,
            article: { id: article.id },
          }),
      );
      await this.warehouseArticleRepository.save(warehouseArticles);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }

  async findAllBrands(): Promise<Brand[]> {
    return this.brandRepository.find();
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(brand);
  }
}
