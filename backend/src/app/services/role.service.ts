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
      relations: ['permissions'],
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
}
