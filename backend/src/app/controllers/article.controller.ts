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
import { CloudinaryService } from '../services/cloudinary.service';

@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Post(':id/image')
  @RequirePermissions('update_articles')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.articleService.updateImage(id, file);
  }

  @Delete(':id')
  @RequirePermissions('delete_articles')
  remove(@Param('id') id: number) {
    return this.articleService.remove(id);
  }

  @Post('brands')
  @UseInterceptors(FileInterceptor('file'))
  createBrand(@Body() createBrandDto: CreateBrandDto, @UploadedFile() file: Express.Multer.File) {
    return this.articleService.createBrand(createBrandDto, file);
  }
}
