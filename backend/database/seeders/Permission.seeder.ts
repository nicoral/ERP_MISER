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
            },
            {
                id: 5,
                name: 'view_administration',
                endpoint: '/administration',
                method: 'GET',
                description: 'Ver panel de administración'
            },
            {
                id: 6,
                name: 'view_warehouses',
                endpoint: '/warehouses',
                method: 'GET',
                description: 'Ver lista de almacenes'
            },
            {
                id: 7,
                name: 'create_warehouse',
                endpoint: '/warehouses',
                method: 'POST',
                description: 'Crear almacenes'
            },
            {
                id: 8,
                name: 'update_warehouse',
                endpoint: '/warehouses/:id',
                method: 'PUT',
                description: 'Actualizar almacenes'
            },
            {
                id: 9,
                name: 'delete_warehouse',
                endpoint: '/warehouses/:id',
                method: 'DELETE',
                description: 'Eliminar almacenes'
            },
            {
                id: 10,
                name: 'view_services',
                endpoint: '/services',
                method: 'GET',
                description: 'Ver lista de servicios'
            },
            {
                id: 11,
                name: 'view_articles',
                endpoint: '/articles',
                method: 'GET',
                description: 'Ver lista de artículos'
            },
            {
                id: 12,
                name: 'view_suppliers',
                endpoint: '/suppliers',
                method: 'GET',
                description: 'Ver lista de proveedores'
            },
            {
                id: 13,
                name: 'create_articles',
                endpoint: '/articles',
                method: 'POST',
                description: 'Crear artículos'
            },
            {
                id: 14,
                name: 'update_articles',
                endpoint: '/articles/:id',
                method: 'PUT',
                description: 'Actualizar artículos'
            },
            {
                id: 15,
                name: 'delete_articles',
                endpoint: '/articles/:id',
                method: 'DELETE',
                description: 'Eliminar artículos'
            }
        ];

        await permissionRepository.insert(permissions);
    }
}