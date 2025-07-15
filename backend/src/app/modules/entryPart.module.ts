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
import { StorageModule } from './storage.module';
import { QRService } from '../services/qr.service';

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
    StorageModule,
  ],
  controllers: [EntryPartController],
  providers: [EntryPartService, QRService],
  exports: [EntryPartService],
})
export class EntryPartModule {}
