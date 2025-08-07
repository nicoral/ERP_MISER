import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentInvoiceController } from '../controllers/paymentInvoice.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentInvoiceService } from '../services/paymentInvoice.service';
import { PaymentDetail } from '../entities/PaymentDetail.entity';
import { PaymentInvoice } from '../entities/PaymentInvoice.entity';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { EmployeeModule } from './employee.module';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { StorageModule } from './storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentDetail, PaymentInvoice, PaymentGroup, PurchaseOrder]),
    EmployeeModule,
    StorageModule,
  ],
  controllers: [PaymentController, PaymentInvoiceController],
  providers: [PaymentService, PaymentInvoiceService],
  exports: [PaymentService, PaymentInvoiceService],
})
export class PaymentModule {}
