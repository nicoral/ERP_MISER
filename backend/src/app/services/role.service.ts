import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/Role.entity';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdatePermissionsDto } from '../dto/permissions/update-permissions.dto';
import { PermissionService } from './permission.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
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

  async updatePermissions(
    id: number,
    updatePermissionsDto: UpdatePermissionsDto,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    const permissions = await this.permissionService.findByIds(
      updatePermissionsDto.permissions,
    );
    role.permissions = permissions;
    return this.roleRepository.save(role);
  }
}
