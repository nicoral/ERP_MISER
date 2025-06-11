import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from '../entities/Article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(WarehouseArticle)
    private readonly warehouseArticleRepository: Repository<WarehouseArticle>,
  ) { }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create(createArticleDto);
    const warehouseArticles = createArticleDto.warehouseArticles.map(warehouseArticle => this.warehouseArticleRepository.create({
      warehouse: { id: warehouseArticle.warehouseId },
      stock: warehouseArticle.stock,
      article: { id: article.id },
    }));
    await this.articleRepository.save(article);
    await this.warehouseArticleRepository.save(warehouseArticles);
    return this.findOne(article.id);
  }

  async findAll(page: number, limit: number, search?: string): Promise<{ data: Article[], total: number }> {
    const query = this.articleRepository.createQueryBuilder('article');
    if (search) {
      query.where('article.name LIKE :search', { search: `%${search}%` });
    }
    const [data, total] = await query.orderBy('article.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id }, relations: ['warehouseArticles', 'warehouseArticles.warehouse'] });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id }, relations: ['warehouseArticles', 'warehouseArticles.warehouse'] });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    await this.articleRepository.update(id, updateArticleDto);
    const warehouseArticles = updateArticleDto.warehouseArticles?.map(warehouseArticle => this.warehouseArticleRepository.create({
      warehouse: { id: warehouseArticle.warehouseId },
      stock: warehouseArticle.stock,
      article: { id: article.id },
    }));
    if (warehouseArticles) {
      await this.warehouseArticleRepository.save(warehouseArticles);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }

}