import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from '../services/auditLog.service';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(1)
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('userId') userId: number,
    @Query('date') date: string
  ) {
    const { data, total } = await this.auditLogService.findAll(
      page,
      limit,
      search,
      userId,
      date
    );
    return { data, total, page, limit };
  }
}
