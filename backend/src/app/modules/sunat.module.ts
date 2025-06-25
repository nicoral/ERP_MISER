import { Module } from '@nestjs/common';
import { SunatController } from '../controllers/sunat.controller';
import { SunatProvider } from '../providers/sunat.provider';

@Module({
  controllers: [SunatController],
  providers: [SunatProvider],
  exports: [SunatProvider],
})
export class SunatModule {} 