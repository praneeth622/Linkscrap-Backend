import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RateLimitTypes } from '../../config/rate-limit.config';

/**
 * Rate limit decorator for authentication endpoints
 * 5 requests per minute per IP
 */
export const AuthRateLimit = () => 
  applyDecorators(
    Throttle({ [RateLimitTypes.AUTH]: { limit: 5, ttl: 60000 } })
  );

/**
 * Rate limit decorator for data collection endpoints (POST)
 * 10 requests per hour per user
 */
export const DataCollectionRateLimit = () =>
  applyDecorators(
    Throttle({ [RateLimitTypes.DATA_COLLECTION]: { limit: 10, ttl: 3600000 } })
  );

/**
 * Rate limit decorator for data retrieval endpoints (GET)
 * 100 requests per hour per user
 */
export const DataRetrievalRateLimit = () =>
  applyDecorators(
    Throttle({ [RateLimitTypes.DATA_RETRIEVAL]: { limit: 100, ttl: 3600000 } })
  );

/**
 * Rate limit decorator for health/status endpoints
 * 60 requests per minute per IP
 */
export const HealthRateLimit = () =>
  applyDecorators(
    Throttle({ [RateLimitTypes.HEALTH]: { limit: 60, ttl: 60000 } })
  );

/**
 * Default rate limit decorator
 * 100 requests per minute per IP
 */
export const DefaultRateLimit = () =>
  applyDecorators(
    Throttle({ [RateLimitTypes.DEFAULT]: { limit: 100, ttl: 60000 } })
  );
