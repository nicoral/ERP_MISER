import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmployeeService } from '../services/employee.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    const employee = await this.employeeService.findOne(user.id);
    const role = await this.employeeService.getRoleWithPermissions(
      employee.role.id
    );

    return requiredPermissions.every(permission =>
      role.permissions.some(p => p.name === permission)
    );
  }
}
