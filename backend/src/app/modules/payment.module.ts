import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentService } from '../services/payment.service';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { PaymentDetail } from '../entities/PaymentDetail.entity';
import { CloudinaryModule } from './cloudinary.module';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentGroup, PaymentDetail]),
    EmployeeModule,
    CloudinaryModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
