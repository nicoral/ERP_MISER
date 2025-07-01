import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';

config();

export const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT ?? '5432'),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: false,
  logging:
    process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeoutMS: 30000,
  extra: {
    max: 20,
    min: 5,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    createRetryIntervalMillis: 200,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
  },
};

export default new DataSource(options);
