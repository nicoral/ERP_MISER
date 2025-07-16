import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryPartController } from '../controllers/entryPart.controller';
import { EntryPartService } from '../services/entryPart.service';
import { EntryPart } from '../entities/EntryPart.entity';
import { EntryPartArticle } from '../entities/EntryPartArticle.entity';
import { EntryPartService as EntryPartServiceEntity } from '../entities/EntryPartService.entity';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { Article } from '../entities/Article.entity';
import { Service } from '../entities/Service.entity';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { EmployeeModule } from './employee.module';
import { StorageModule } from './storage.module';
import { QRService } from '../services/qr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntryPart,
      EntryPartArticle,
      EntryPartServiceEntity,
      PurchaseOrder,
      Article,
      Service,
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
