import { Injectable, NotFoundException } from '@nestjs/common';
import { Article } from '../entities/article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) { }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const article = this.articleRepository.create({
      ...createArticleDto,
    });
    return this.articleRepository.save(article);
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
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    await this.articleRepository.update(id, updateArticleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }

}