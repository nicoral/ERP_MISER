import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Employee } from '../entities/Employee.entity';
import { CreateEmployeeDto } from '../dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employee/update-employee.dto';
import { EmployeeService } from '../services/employee.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @RequirePermissions('create_employee')
  @AuditDescription('Creación de nuevo empleado')
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto
  ): Promise<Employee> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @RequirePermissions('view_employees')
  @AuditDescription('Consulta de lista de empleados')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    const { data, total } = await this.employeeService.findAll(
      page,
      limit,
      search
    );
    return { data, total, page, limit };
  }

  @Get(':id')
  @RequirePermissions('view_employees')
  @AuditDescription('Consulta de detalle de empleado')
  async findOne(@Param('id') id: number): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_employee')
  @AuditDescription('Actualización de empleado')
  async update(
    @Param('id') id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_employee')
  @AuditDescription('Eliminación de empleado')
  async remove(@Param('id') id: number): Promise<void> {
    return this.employeeService.remove(id);
  }

  @Post(':id/image')
  @RequirePermissions('update_employee')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de imagen de empleado')
  async uploadImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.employeeService.updateImage(id, file);
  }
}
