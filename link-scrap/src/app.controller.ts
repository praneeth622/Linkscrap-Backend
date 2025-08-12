import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { HealthRateLimit, DefaultRateLimit } from './common/decorators/rate-limit.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @DefaultRateLimit()
  @ApiOperation({
    summary: 'Welcome message',
    description: 'Returns a welcome message for the LinkedIn BrightData API'
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message returned successfully',
    schema: {
      type: 'string',
      example: 'Welcome to LinkedIn BrightData API! Visit /api-docs for documentation.'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @HealthRateLimit()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API'
  })
  @ApiResponse({
    status: 200,
    description: 'Health status returned successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-01-12T10:30:45.123Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  getHealth() {
    return this.appService.getHealth();
  }
}