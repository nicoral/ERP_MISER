import config from './config';
import { ConfigModuleOptions } from '@nestjs/config';

export const forRootObject: ConfigModuleOptions = {
  envFilePath: '.env',
  load: [config],
  isGlobal: true,
};
