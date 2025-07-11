import { Module } from '@nestjs/common';
import { PurchaseOrderController } from '../controllers/purchaseOrder.controller';
import { PurchaseOrderService } from '../services/purchaseOrder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { QuotationRequest } from '../entities/QuotationRequest.entity';
import { Employee } from '../entities/Employee.entity';
import { Supplier } from '../entities/Supplier.entity';
import { Requirement } from '../entities/Requirement.entity';
import { CostCenter } from '../entities/CostCenter.entity';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { QRService } from '../services/qr.service';
import { EmployeeModule } from './employee.module';
import { EntryPartModule } from './entryPart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      QuotationRequest,
      Employee,
      Supplier,
      Requirement,
      CostCenter,
      PaymentGroup,
    ]),
    EmployeeModule,
    EntryPartModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, QRService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
