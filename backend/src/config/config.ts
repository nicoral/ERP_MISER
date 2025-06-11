import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    typeorm: {
      connection: process.env.TYPEORM_CONNECTION,
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT ?? '3306'),
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      synchronize: false,
      logging: process.env.TYPEORM_LOGGING,
      entities: process.env.TYPEORM_ENTITIES,
      migrations: process.env.TYPEORM_MIGRATIONS,
      migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
      migrationsTable: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
    },
  };
});
