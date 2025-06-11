import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Employee } from '../../app/entities/Employee.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '5432'),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [Employee],
  synchronize: false,
});

async function testConnection() {
  try {
    await dataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos');
    console.log('Configuración:', {
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
    });
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('Configuración actual:', {
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
    });
  }
}

testConnection();
