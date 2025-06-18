import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/AuditLog.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    userId?: number,
    date?: string
  ): Promise<{ data: AuditLog[]; total: number }> {
    const query = this.auditLogRepository.createQueryBuilder('auditLog');
    query.leftJoinAndSelect('auditLog.employee', 'employee');
    if (search) {
      query.where('auditLog.action LIKE :search', { search: `%${search}%` });
    }
    if (userId) {
      query.where('auditLog.employee.id = :userId', { userId });
    }
    if (date) {
      query.where(
        'auditLog.timestamp >= :dateIni AND auditLog.timestamp <= :dateFin',
        {
          dateIni: new Date(date).setHours(0, 0, 0, 0),
          dateFin: new Date(date).setHours(23, 59, 59, 999),
        }
      );
    }
    const [data, total] = await query
      .orderBy('auditLog.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }
}
