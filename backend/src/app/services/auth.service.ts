import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeeService } from './employee.service';
import * as bcrypt from 'bcrypt';
import { Employee } from '../entities/Employee.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService
  ) {}

  async getEmployeeWithPermissions(id: number) {
    const employee = await this.employeeService.findOne(id);
    const role = await this.employeeService.getRoleWithPermissions(
      employee.role.id
    );
    return { employee, role };
  }

  async validateUser(email: string, password: string) {
    const employee = await this.employeeService.findByEmail(email);

    if (!employee) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return employee;
  }

  async login(employee: Employee) {
    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
      imageUrl: employee.imageUrl,
    };

    return {
      access_token: this.jwtService.sign(payload),
      employee: {
        id: employee.id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        imageUrl: employee.imageUrl,
        role: await this.employeeService.getRoleWithPermissions(
          employee.role.id
        ),
      },
    };
  }
}
