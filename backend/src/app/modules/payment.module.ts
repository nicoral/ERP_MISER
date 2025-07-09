import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentDetail } from '../entities/PaymentDetail.entity';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { CloudinaryModule } from './cloudinary.module';
import { EmployeeModule } from './employee.module';
import { PaymentGroup } from '../entities/PaymentGroup.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentDetail, PaymentGroup, PurchaseOrder]),
    EmployeeModule,
    CloudinaryModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
