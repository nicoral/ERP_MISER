import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { Article } from '../entities/Article.entity';
import { EmployeeModule } from './employee.module';
import { StorageModule } from './storage.module';
import { ExitPart } from '../entities/ExitPart.entity';
import { ExitPartArticle } from '../entities/ExitPartArticle.entity';
import { ExitPartController } from '../controllers/exitPart.controller';
import { ExitPartService } from '../services/exitPart.service';
import { ExitPartService as ExitPartServiceEntity } from '../entities/ExitPartService.entity';
import { QRService } from '../services/qr.service';
import { Service } from '../entities/Service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExitPart,
      ExitPartArticle,
      ExitPartServiceEntity,
      Service,
      PurchaseOrder,
      Article,
    ]),
    EmployeeModule,
    StorageModule,
  ],
  controllers: [ExitPartController],
  providers: [ExitPartService, QRService],
  exports: [ExitPartService],
})
export class ExitPartModule {}
