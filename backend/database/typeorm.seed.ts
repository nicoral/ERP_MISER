import { config } from 'dotenv';
import { runSeeders } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { options } from './dataSource';
import EmployeeSeed from './seeders/Employee.seeder';
import RoleSeeder from './seeders/Role.seeder';
import PermissionSeeder from './seeders/Permission.seeder';

config();
export const dataSource = new DataSource(options);
(async () => {
  await dataSource.initialize();
  await runSeeders(dataSource, {
    seeds: [
      PermissionSeeder,
      RoleSeeder,
      EmployeeSeed
    ],
  });
})();
