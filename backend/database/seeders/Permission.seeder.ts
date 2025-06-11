import { DataSource } from "typeorm";
import { Permission } from "../../src/app/entities/Permission.entity";
import { Seeder } from "typeorm-extension";

export default class PermissionSeeder implements Seeder {

    public async run(dataSource: DataSource) {
        const permissionRepository = dataSource.getRepository(Permission);

        const permissions = [
          {
              id: 1,
              name: 'create_employee',
              endpoint: '/employees',
              method: 'POST',
              description: 'Crear empleados'
          },
          {
              id: 2,
              name: 'view_employees',
              endpoint: '/employees',
              method: 'GET',
              description: 'Ver lista de empleados'
          },
          {
              id: 3,
              name: 'update_employee',
              endpoint: '/employees/:id',
              method: 'PUT',
              description: 'Actualizar empleados'
          },
          {
              id: 4,
              name: 'delete_employee',
              endpoint: '/employees/:id',
              method: 'DELETE',
              description: 'Eliminar empleados'
          }
      ];

      await permissionRepository.insert(permissions);
    }
}