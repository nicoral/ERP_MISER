import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/Article.entity';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { EmployeeModule } from './employee.module';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { Brand } from '../entities/Brand.entity';
import { Warehouse } from '../entities/Warehouse.entity';
import { ExcelImportService } from '../services/excel-import.service';
import { StorageModule } from './storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, WarehouseArticle, Brand, Warehouse]),
    StorageModule,
    EmployeeModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ExcelImportService],
  exports: [ArticleService],
})
export class ArticleModule {}
