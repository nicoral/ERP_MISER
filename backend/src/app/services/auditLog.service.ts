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
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.employee', 'employee');

    // Build conditions array
    const conditions: Array<{
      condition: string;
      params: Record<string, string | number>;
    }> = [];

    if (search) {
      conditions.push({
        condition: 'auditLog.action LIKE :search',
        params: { search: `%${search}%` },
      });
    }

    if (userId) {
      conditions.push({
        condition: 'auditLog.employee.id = :userId',
        params: { userId },
      });
    }

    if (date) {
      conditions.push({
        condition: 'DATE(auditLog.timestamp) = :date',
        params: { date },
      });
    }

    // Apply conditions
    conditions.forEach((condition, index) => {
      if (index === 0) {
        query.where(condition.condition, condition.params);
      } else {
        query.andWhere(condition.condition, condition.params);
      }
    });

    const [data, total] = await query
      .orderBy('auditLog.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }
}
