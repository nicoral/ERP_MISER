import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { CreateArticleDto } from '../dto/article/create-article.dto';
import { UpdateArticleDto } from '../dto/article/update-article.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CreateBrandDto } from '../dto/article/create-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
  ) {}

  @Post()
  @RequirePermissions('create_articles')
  @AuditDescription('Creación de nuevo artículo')
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @RequirePermissions('view_articles')
  @AuditDescription('Consulta de lista de artículos')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.articleService.findAll(page, limit, search);
    return { data, total, page, limit };
  }

  @Get('list/simple')
  @AuditDescription('Consulta de lista de artículos')
  async listSimple(@Query('search') search?: string) {
    return this.articleService.listSimple(search);
  }

  @Get('brands')
  @AuditDescription('Consulta de lista de marcas')
  findAllBrands() {
    return this.articleService.findAllBrands();
  }

  @Get(':id')
  @RequirePermissions('view_articles')
  @AuditDescription('Consulta de detalle de artículo')
  findOne(@Param('id') id: number) {
    return this.articleService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_articles')
  @AuditDescription('Actualización de artículo')
  update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(id, updateArticleDto);
  }

  @Post(':id/image')
  @RequirePermissions('update_articles')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de imagen de artículo')
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.articleService.updateImage(id, file);
  }

  @Delete(':id')
  @RequirePermissions('delete_articles')
  @AuditDescription('Eliminación de artículo')
  remove(@Param('id') id: number) {
    return this.articleService.remove(id);
  }

  @Post('brands')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Creación de nueva marca')
  createBrand(@Body() createBrandDto: CreateBrandDto, @UploadedFile() file: Express.Multer.File) {
    return this.articleService.createBrand(createBrandDto, file);
  }
  
}
