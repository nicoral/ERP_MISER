import { Employee } from '../../src/app/entities/Employee.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { Seeder } from 'typeorm-extension';
import { Role } from '../../src/app/entities/Role.entity';

const EMPLOYEE_COUNT = 0;

export default class EmployeeSeed implements Seeder {
  public async run(dataSource: DataSource) {
    const repository = dataSource.getRepository(Employee);
    const roleRepository = dataSource.getRepository(Role);
    const roles = await roleRepository.find();
    const admin = {
      email: 'admin@example.com',
      password: await bcrypt.hash('123456789', 10),
      firstName: 'Admin',
      lastName: 'User',
      position: 'Administrador',
      phone: '3000000000',
      role: roles.find(role => role.name === 'admin'),
      documentId: '1234567890',
      documentType: 'DNI',
      address: 'Cuzco, Perú',
      imageUrl: 'https://example.com/image.jpg',
      hireDate: new Date(),
      dischargeDate: null,
      active: true,
    };

    const user = {
      email: 'user@example.com',
      password: await bcrypt.hash('123456789', 10),
      firstName: 'User',
      lastName: 'User',
      position: 'Usuario',
      phone: '3000000000',
      role: roles.find(role => role.name === 'user'),
      documentId: '1234567891',
      documentType: 'DNI',
      address: 'Cuzco, Perú',
      imageUrl: 'https://example.com/image.jpg',
      hireDate: new Date(),
      dischargeDate: null,
      active: true,
    }

    await repository.insert([admin, user]);
    const rolesWithoutAdmin = roles.filter(role => role.name !== 'admin');
    for (let i = 0; i < EMPLOYEE_COUNT; i++) {
      const employee = {
        email: faker.internet.email().toLowerCase(),
        password: await bcrypt.hash(faker.internet.password({ length: 8 }), 10),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        position: faker.person.jobTitle(),
        phone: `3${faker.number.int({ min: 100000000, max: 999999999 })}`,
        role: rolesWithoutAdmin[faker.number.int({ min: 0, max: rolesWithoutAdmin.length - 1 })],
        active: faker.datatype.boolean(),
        documentId: faker.string.numeric(10),
        documentType: 'DNI',
        address: faker.location.streetAddress(),
        imageUrl: faker.image.url(),
        hireDate: faker.date.recent(),
        dischargeDate: null,
      };
      await repository.save(employee);
    }
  }
}
