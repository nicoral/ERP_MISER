import { DataSource } from "typeorm";
import { Role } from "../../src/app/entities/Role.entity";
import { Seeder } from "typeorm-extension";
import { Permission } from "../../src/app/entities/Permission.entity";

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource) {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    const permissions = await permissionRepository.find();

    const roles = [
      {
        id: 1,
        name: 'admin',
        description: 'Administrador del sistema',
        permissions: permissions
      },
      {
        id: 2,
        name: 'user',
        description: 'Usuario del sistema',
        permissions: permissions.filter(permission => permission.id === 2)
      },
      {
        id: 3,
        name: 'default',
        description: 'Invitado del sistema'
      }
    ];

    for (const role of roles) {
      await roleRepository.save(role);
    }
  }
}