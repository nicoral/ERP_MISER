import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Employee } from '../entities/Employee.entity';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from '../dto/employee/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/employee/update-employee.dto';
import { EmployeeProfileDto } from '../dto/employee/employee-profile.dto';
import { RoleService } from './role.service';
import { Warehouse } from '../entities/Warehouse.entity';
import { StorageService } from './storage.service';
import { ExcelImportService } from './excel-import.service';
import { ImportEmployeeRowDto } from '../dto/employee/import-employee.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
    private readonly storageService: StorageService,
    private readonly excelImportService: ExcelImportService
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
    if (employee.imageUrl) {
      await this.storageService.removeFileByUrl(employee.imageUrl);
    }
    const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `employees/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype
    );
    employee.imageUrl = uploadResult.url;
    return this.employeeRepository.save(employee);
  }

  async getEmployeeWithWarehouses(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['warehousesAssigned'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return {
      employee,
      warehouses: employee.warehousesAssigned,
    };
  }

  async importFromExcel(file: Express.Multer.File): Promise<{
    success: number;
    errors: Array<{ row: number; error: string }>;
    total: number;
  }> {
    try {
      // Parsear el archivo Excel
      const employeesData =
        await this.excelImportService.parseEmployeeExcel(file);

      const results = {
        success: 0,
        errors: [] as Array<{ row: number; error: string }>,
        total: employeesData.length,
      };

      const roleDefault = await this.roleService.findDefaultRole();

      // Pre-validar todos los datos antes de procesar
      const validationResults = await this.preValidateEmployees(employeesData);
      results.errors.push(...validationResults.errors);

      // Filtrar empleados válidos para procesamiento
      const validEmployees = employeesData.filter(
        (_, index) =>
          !validationResults.errors.some(error => error.row === index + 2)
      );

      if (validEmployees.length === 0) {
        return results;
      }

      // Procesar empleados en lotes para mejor rendimiento
      const batchSize = 50; // Procesar 50 empleados a la vez
      const batches: ImportEmployeeRowDto[][] = [];

      for (let i = 0; i < validEmployees.length; i += batchSize) {
        batches.push(validEmployees.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchResults = await this.processEmployeeBatch(
          batch,
          roleDefault
        );
        results.success += batchResults.success;
        results.errors.push(...batchResults.errors);
      }

      return results;
    } catch (error) {
      throw new BadRequestException(
        'Error al procesar el archivo: ' + error.message
      );
    }
  }

  /**
   * Pre-valida todos los empleados para detectar errores antes del procesamiento
   */
  private async preValidateEmployees(
    employeesData: ImportEmployeeRowDto[]
  ): Promise<{
    errors: Array<{ row: number; error: string }>;
  }> {
    const errors: Array<{ row: number; error: string }> = [];

    // Validar campos requeridos
    for (let i = 0; i < employeesData.length; i++) {
      const employeeData = employeesData[i];
      const requiredFields = [
        'email',
        'documentId',
        'firstName',
        'lastName',
        'position',
        'phone',
        'address',
      ];
      const missingFields = requiredFields.filter(
        field => !employeeData[field]
      );

      if (missingFields.length > 0) {
        errors.push({
          row: i + 2,
          error: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        });
      }
    }

    // Obtener todos los emails y documentos existentes en una sola consulta
    const existingEmails = await this.employeeRepository
      .createQueryBuilder('employee')
      .select(['employee.email', 'employee.documentId'])
      .getMany();

    const existingEmailSet = new Set(existingEmails.map(e => e.email));
    const existingDocumentSet = new Set(existingEmails.map(e => e.documentId));

    // Validar duplicados
    for (let i = 0; i < employeesData.length; i++) {
      const employeeData = employeesData[i];

      if (employeeData.email && existingEmailSet.has(employeeData.email)) {
        errors.push({
          row: i + 2,
          error: `El email ${employeeData.email} ya existe`,
        });
      }

      if (
        employeeData.documentId &&
        existingDocumentSet.has(employeeData.documentId)
      ) {
        errors.push({
          row: i + 2,
          error: `El documento ${employeeData.documentId} ya existe`,
        });
      }
    }

    return { errors };
  }

  /**
   * Procesa un lote de empleados de manera optimizada
   */
  private async processEmployeeBatch(
    employeesData: ImportEmployeeRowDto[],
    roleDefault: { id: number }
  ): Promise<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const errors: Array<{ row: number; error: string }> = [];
    let success = 0;
    const EMPLOYEES_AREAS = {
      RUMA: 'RUMA',
      CONTABILIDAD: 'CONTABILIDAD',
      RRHH: 'RRHH',
      FINANZAS: 'FINANZAS',
      HSE: 'HSE',
      GERENCIA: 'GERENCIA',
      PROYECTOS: 'PROYECTOS',
      LOGISTICA: 'LOGISTICA',
      VIGILANCIA: 'VIGILANCIA',
      TRANSPORTE: 'TRANSPORTE',
    };
    try {
      // Preparar todos los empleados para inserción
      const employeesToInsert = employeesData.map(employeeData => {
        const createEmployeeDto: Partial<CreateEmployeeDto> = {
          email: employeeData.email!,
          password: employeeData.documentId!, // Se hasheará en el create
          documentId: employeeData.documentId!,
          documentType: employeeData.documentType || 'DNI',
          firstName: employeeData.firstName!,
          lastName: employeeData.lastName!,
          area: employeeData.area || '',
          position: employeeData.position!,
          phone: employeeData.phone!,
          address: employeeData.address!,
          active:
            employeeData.active !== undefined ? employeeData.active : true,
          warehousesAssigned: [],
          role: roleDefault.id,
        };

        // Agregar campos opcionales solo si están presentes
        if (employeeData.hireDate) {
          createEmployeeDto.hireDate = new Date(employeeData.hireDate);
        }
        if (employeeData.birthDate) {
          createEmployeeDto.birthDate = new Date(employeeData.birthDate);
        }
        if (employeeData.area) {
          if (
            !Object.values(EMPLOYEES_AREAS).includes(
              employeeData.area.toUpperCase()
            )
          ) {
            throw new BadRequestException(
              `Area "${employeeData.area}" no válida`
            );
          }
          createEmployeeDto.area = employeeData.area.toUpperCase();
        }

        createEmployeeDto.warehousesAssigned =
          createEmployeeDto.area === EMPLOYEES_AREAS.RUMA
            ? [2]
            : createEmployeeDto.area === EMPLOYEES_AREAS.TRANSPORTE
              ? [1]
              : [3];

        return createEmployeeDto;
      });

      // Procesar empleados en paralelo con límite de concurrencia
      const concurrencyLimit = 10; // Procesar máximo 10 empleados en paralelo
      const chunks: Partial<CreateEmployeeDto>[][] = [];

      for (let i = 0; i < employeesToInsert.length; i += concurrencyLimit) {
        chunks.push(employeesToInsert.slice(i, i + concurrencyLimit));
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async createEmployeeDto => {
          try {
            const employee = await this.create(
              createEmployeeDto as CreateEmployeeDto
            );
            return { success: true, employee };
          } catch (error) {
            return {
              success: false,
              error: error.message || 'Error desconocido al crear empleado',
            };
          }
        });

        const chunkResults = await Promise.all(chunkPromises);

        chunkResults.forEach((result, index) => {
          if (result.success) {
            success++;
          } else {
            errors.push({
              row: chunks.indexOf(chunk) * concurrencyLimit + index + 2,
              error: result.error,
            });
          }
        });
      }
    } catch (error) {
      errors.push({
        row: 0,
        error: `Error en el procesamiento del lote: ${error.message}`,
      });
    }

    return { success, errors };
  }

  async generateImportTemplate(): Promise<Buffer> {
    return this.excelImportService.generateEmployeeTemplate();
  }

  /**
   * Obtiene el perfil completo del empleado incluyendo la firma
   */
  async getProfile(id: number): Promise<EmployeeProfileDto> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['role', 'warehousesAssigned'],
      withDeleted: true,
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Transformar usando el DTO específico que incluye la firma
    return plainToClass(EmployeeProfileDto, employee, {
      excludeExtraneousValues: true,
    });
  }

  async updateSignature(id: number, file: Express.Multer.File) {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const path = `employees/signatures/${fileName}`;
    const uploadResult = await this.storageService.uploadFile(
      path,
      file.buffer,
      file.mimetype,
      false
    );
    employee.signature = uploadResult.path;
    return this.employeeRepository.save(employee);
  }

  async listSimple(search?: string) {
    const query = this.employeeRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        documentId: true,
      },
      where: [
        {
          firstName: ILike(`%${search}%`),
        },
        {
          lastName: ILike(`%${search}%`),
        },
        {
          email: ILike(`%${search}%`),
        },
        {
          documentId: ILike(`%${search}%`),
        },
      ],
    });
    return query;
  }
}
