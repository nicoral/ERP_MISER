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
import { Reflector } from '@nestjs/core';
import { AUDIT_DESCRIPTION_KEY } from './decorators/audit-description.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<object | null> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const action = request.method.toLowerCase();
    const url = request.url;
    const entity = context.getClass().name;
    const entityId = request.params?.id;
    const ipAddress = request.ip;
    const oldValue: object | null = request.oldValue || null;

    // Get the audit description from the decorator
    const description = this.reflector.get<string>(
      AUDIT_DESCRIPTION_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(async (result: object | null) => {
        if (['post', 'put', 'delete'].includes(action)) {
          let employee: Employee | undefined = undefined;
          if (userId) {
            employee =
              (await this.employeeRepository.findOne({
                where: { id: userId },
              })) || undefined;
          } else if (
            result &&
            'employee' in result &&
            result.employee &&
            typeof result.employee === 'object' &&
            'id' in result.employee &&
            typeof result.employee.id === 'number'
          ) {
            employee =
              (await this.employeeRepository.findOne({
                where: { id: result.employee.id as number },
              })) || undefined;
          }

          // Generate a more detailed description if none is provided
          const defaultDescription = this.generateDefaultDescription(
            action,
            entity,
            result as object,
            oldValue as object,
          );

          const audit = this.auditLogRepository.create({
            action: action === 'post' && entity === 'AuthController' ? 'login' : action,
            entity: entity ?? null,
            entityId: entityId ?? null,
            employee,
            ipAddress: ipAddress ?? null,
            url: url ?? null,
            oldValue: oldValue ?? null,
            newValue: result ?? null,
            details: description || defaultDescription,
          } as DeepPartial<AuditLog>);
          await this.auditLogRepository.save(audit);
        }
      }),
    );
  }

  private generateDefaultDescription(
    action: string,
    entity: string,
    newValue: object,
    oldValue: object,
  ): string {
    const entityName = entity.replace('Controller', '');
    const actionMap = {
      post: 'Creación',
      put: 'Actualización',
      delete: 'Eliminación',
      login: 'Inicio de sesión',
    };

    const baseDescription = `${actionMap[action] || action} de ${entityName}`;

    if (action === 'put' && oldValue && newValue) {
      const changes = this.getChanges(oldValue, newValue);
      if (changes.length > 0) {
        return `${baseDescription}: ${changes.join(', ')}`;
      }
    }

    return baseDescription;
  }

  private getChanges(oldValue: object, newValue: object): string[] {
    const changes: string[] = [];
    for (const key in newValue) {
      if (
        oldValue[key] !== newValue[key] &&
        typeof newValue[key] !== 'object' &&
        key !== 'password' &&
        key !== 'updatedAt'
      ) {
        changes.push(`${key}: ${oldValue[key]} → ${newValue[key]}`);
      }
    }
    return changes;
  }
}
