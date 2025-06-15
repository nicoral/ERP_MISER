import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/Article.entity';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { EmployeeModule } from './employee.module';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { Brand } from '../entities/Brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, WarehouseArticle, Brand]),
    EmployeeModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
