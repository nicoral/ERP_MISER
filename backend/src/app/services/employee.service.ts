import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/Employee.entity';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from '../dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employee/update-employee.dto';
import { RoleService } from './role.service';
import { Warehouse } from '../entities/Warehouse.entity';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const hashedPassword = await bcrypt.hash(
      createEmployeeDto.password ?? createEmployeeDto.documentId,
      10
    );
    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      password: hashedPassword,
      active: true,
      role: {
        id:
          createEmployeeDto.role ??
          (await this.roleService.findDefaultRole()).id,
      },
      warehousesAssigned: createEmployeeDto.warehousesAssigned.map(id => ({
        id,
      })),
    });
    return this.employeeRepository.save(employee);
  }

  async getRoleWithPermissions(roleId: number) {
    const role = await this.roleService.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return role;
  }

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Employee[]; total: number }> {
    const query = this.employeeRepository.createQueryBuilder('employee');

    if (search) {
      query.where(
        'employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.email ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query
      .orderBy('employee.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['role', 'warehousesAssigned'],
      withDeleted: true,
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    const employee = await this.findOne(id);
    if (updateEmployeeDto.password) {
      updateEmployeeDto.password = await bcrypt.hash(
        updateEmployeeDto.password,
        10
      );
    }

    if (updateEmployeeDto.warehousesAssigned) {
      employee.warehousesAssigned = updateEmployeeDto.warehousesAssigned.map(
        id => ({ id: id }) as Warehouse
      );
      delete updateEmployeeDto.warehousesAssigned;
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    employee.active = false;
    await this.employeeRepository.save(employee);
    await this.employeeRepository.softRemove(employee);
  }

  async updateImage(id: number, file: Express.Multer.File) {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    const uploadResult = await this.cloudinaryService.uploadFile(
      file,
      'employees'
    );
    employee.imageUrl = uploadResult.secure_url;
    return this.employeeRepository.save(employee);
  }
}
