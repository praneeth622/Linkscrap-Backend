import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Welcome to LinkedIn BrightData API! Visit /api-docs for documentation.';
  }

  async getHealth() {
    const startTime = process.uptime();
    
    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: startTime,
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        services: {
          database: 'healthy',
          brightdata: 'available',
          redis: process.env.REDIS_HOST ? 'configured' : 'memory-fallback'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: startTime,
        database: 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        error: error.message,
        services: {
          database: 'unhealthy',
          brightdata: 'unknown',
          redis: process.env.REDIS_HOST ? 'configured' : 'memory-fallback'
        }
      };
    }
  }
}
