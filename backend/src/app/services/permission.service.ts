import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../entities/Permission.entity';
import { CreatePermissionDto } from '../dto/permissions/create-permission.dto';
import { UpdatePermissionDto } from '../dto/permissions/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return permission;
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<Permission> {
    const permission = await this.findById(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async delete(id: number): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionRepository.remove(permission);
  }

  async findByIds(ids: number[]): Promise<Permission[]> {
    return this.permissionRepository.find({ where: { id: In(ids) } });
  }

  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({ where: { module } });
  }

  async findByRole(roleId: number): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.role', 'role')
      .where('role.id = :roleId', { roleId })
      .getMany();
  }
}
