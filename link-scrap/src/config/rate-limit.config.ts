import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: 60000, // 1 minute
      limit: 100, // Default 100 requests per minute
    },
    {
      name: 'auth',
      ttl: 60000, // 1 minute
      limit: 5, // 5 requests per minute for auth endpoints
    },
    {
      name: 'data-collection',
      ttl: 3600000, // 1 hour
      limit: 10, // 10 requests per hour for data collection endpoints
    },
    {
      name: 'data-retrieval',
      ttl: 3600000, // 1 hour  
      limit: 100, // 100 requests per hour for data retrieval endpoints
    },
    {
      name: 'health',
      ttl: 60000, // 1 minute
      limit: 60, // 60 requests per minute for health endpoints
    },
  ],
};

// Rate limiting configuration for different endpoint types
export const RateLimitTypes = {
  AUTH: 'auth',
  DATA_COLLECTION: 'data-collection', 
  DATA_RETRIEVAL: 'data-retrieval',
  HEALTH: 'health',
  DEFAULT: 'default',
} as const;
