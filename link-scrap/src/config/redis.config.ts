import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  ttl: 60, // Default TTL in seconds
  max: 100, // Maximum number of items in cache
  isGlobal: true,
};

// Fallback to memory store if Redis is not available
export const memoryStoreConfig: CacheModuleOptions = {
  ttl: 60,
  max: 100,
  isGlobal: true,
};
