import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { PermissionService } from './permission.service';
import { UpdateRoleDto } from '../dto/role/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionService
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...roleData } = createRoleDto;
    const role = this.roleRepository.create(roleData);
    const roleSaved = await this.roleRepository.save(role);
    roleSaved.permissions = await this.permissionService.findByIds(permissions);
    return this.roleRepository.save(roleSaved);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: {
        permissions: true,
        employees: true,
      },
      withDeleted: true,
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findDefaultRole(): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: 'default' },
    });
    if (!role) {
      throw new NotFoundException(`Role default not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    const { permissions, ...roleData } = updateRoleDto;
    role.permissions = await this.permissionService.findByIds(permissions);
    Object.assign(role, roleData);
    return this.roleRepository.save(role);
  }

  async findDistribution(): Promise<{ name: string; value: number }[]> {
    const roles = await this.roleRepository.find({
      relations: ['employees'],
    });
    const distribution = roles.map(role => ({
      name: role.name,
      value: role.employees.length,
    }));
    return distribution;
  }

  async remove(id: number): Promise<void> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Verificar si hay empleados usando este rol
    const employeesWithRole = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.employees', 'employees')
      .where('role.id = :id', { id })
      .getOne();

    if (employeesWithRole && employeesWithRole.employees.length > 0) {
      throw new NotFoundException(
        `Cannot delete role. There are ${employeesWithRole.employees.length} employees using this role.`
      );
    }

    await this.roleRepository.softRemove(role);
  }
}
