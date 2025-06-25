import { config } from 'dotenv';
import { runSeeders } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { options } from './dataSource';
import EmployeeSeed from './seeders/Employee.seeder';
import GeneralSettingsSeeder from './seeders/GeneralSettings.seeder';

config();
export const dataSource = new DataSource(options);
(async () => {
  await dataSource.initialize();
  await runSeeders(dataSource, {
    seeds: [
      EmployeeSeed,
      GeneralSettingsSeeder
    ],
  });
})();
