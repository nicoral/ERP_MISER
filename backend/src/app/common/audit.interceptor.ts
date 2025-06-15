import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AuditLog } from '../entities/AuditLog.entity';
import { Employee } from '../entities/Employee.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<object | null> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const action = request.method.toLowerCase(); // 'post', 'put', 'delete', etc.
    const entity = context.getClass().name;
    const entityId = request.params?.id;
    const ipAddress = request.ip;
    const oldValue: object | null = request.oldValue || null; // Puede ser objeto o null

    return next.handle().pipe(
      tap(async (result: object | null) => {
        if (['post', 'put', 'delete'].includes(action)) {
          let employee: Employee | undefined = undefined;
          if (userId) {
            employee =
              (await this.employeeRepository.findOne({
                where: { id: userId },
              })) || undefined;
          }
          const audit = this.auditLogRepository.create({
            action,
            entity: entity ?? null,
            entityId: entityId ?? null,
            employee,
            ipAddress: ipAddress ?? null,
            oldValue: oldValue ?? null,
            newValue: result ?? null,
            details: undefined,
          } as DeepPartial<AuditLog>);
          await this.auditLogRepository.save(audit);
        }
      }),
    );
  }
}
