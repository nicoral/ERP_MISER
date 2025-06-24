import { Module } from '@nestjs/common';
import { ExcelImportService } from '../services/excel-import.service';

@Module({
  providers: [ExcelImportService],
  exports: [ExcelImportService],
})
export class ExcelImportModule {}
