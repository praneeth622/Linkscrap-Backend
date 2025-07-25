import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LinkedinRequest } from '../entities';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: process.env.DATABASE_URL ,
    entities: [LinkedinRequest],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
  }),
);