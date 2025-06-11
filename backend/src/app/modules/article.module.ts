import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../entities/article.entity';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), EmployeeModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}