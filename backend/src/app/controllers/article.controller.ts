import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CreateBrandDto } from '../dto/article/create-brand.dto';

@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @RequirePermissions('create_articles')
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @RequirePermissions('view_articles')
  findAll(@Query() query: { page: number; limit: number; search: string }) {
    return this.articleService.findAll(query.page, query.limit, query.search);
  }

  @Get('brands')
  findAllBrands() {
    return this.articleService.findAllBrands();
  }

  @Get(':id')
  @RequirePermissions('view_articles')
  findOne(@Param('id') id: number) {
    return this.articleService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_articles')
  update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_articles')
  remove(@Param('id') id: number) {
    return this.articleService.remove(id);
  }

  @Post('brands')
  createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.articleService.createBrand(createBrandDto);
  }
}
