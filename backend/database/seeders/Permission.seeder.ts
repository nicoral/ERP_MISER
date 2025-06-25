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
                name: 'view_employee',
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
            },
            // Permisos para el flujo de firmas de requerimientos
            {
                id: 16,
                name: 'requirement.view.all',
                endpoint: '/requirements',
                method: 'GET',
                description: 'Ver todos los requerimientos (Admin)'
            },
            {
                id: 17,
                name: 'requirement.view.signed1',
                endpoint: '/requirements',
                method: 'GET',
                description: 'Ver requerimientos con 1 firma o más'
            },
            {
                id: 18,
                name: 'requirement.view.signed2',
                endpoint: '/requirements',
                method: 'GET',
                description: 'Ver requerimientos con 2 firmas o más'
            },
            {
                id: 19,
                name: 'requirement.view.signed3',
                endpoint: '/requirements',
                method: 'GET',
                description: 'Ver requerimientos con 3 firmas o más'
            },
            {
                id: 20,
                name: 'requirement.sign',
                endpoint: '/requirements/sign/:id',
                method: 'POST',
                description: 'Firmar requerimientos'
            },
            // Permisos avanzados
            {
                id: 21,
                name: 'advanced.system_config',
                module: 'advanced',
                endpoint: '/system/config',
                method: 'GET',
                description: 'Configuración del sistema'
            },
            {
                id: 22,
                name: 'advanced.audit_logs',
                module: 'advanced',
                endpoint: '/audit-logs',
                method: 'GET',
                description: 'Ver logs de auditoría'
            },
            {
                id: 23,
                name: 'advanced.data_export',
                module: 'advanced',
                endpoint: '/export',
                method: 'POST',
                description: 'Exportar datos del sistema'
            },
            {
                id: 24,
                name: 'advanced.backup_restore',
                module: 'advanced',
                endpoint: '/backup',
                method: 'POST',
                description: 'Backup y restauración'
            },
            {
                id: 25,
                name: 'advanced.user_management',
                module: 'advanced',
                endpoint: '/users',
                method: 'GET',
                description: 'Gestión avanzada de usuarios'
            }
        ];

        await permissionRepository.insert(permissions);
    }
}