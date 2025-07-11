import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryPartController } from '../controllers/entryPart.controller';
import { EntryPartService } from '../services/entryPart.service';
import { EntryPart } from '../entities/EntryPart.entity';
import { EntryPartArticle } from '../entities/EntryPartArticle.entity';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { Article } from '../entities/Article.entity';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { EmployeeModule } from './employee.module';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntryPart,
      EntryPartArticle,
      PurchaseOrder,
      Article,
      WarehouseArticle,
    ]),
    EmployeeModule,
    CloudinaryModule,
  ],
  controllers: [EntryPartController],
  providers: [EntryPartService],
  exports: [EntryPartService],
})
export class EntryPartModule {}
