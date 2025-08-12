import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App Controller (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Welcome to LinkedIn BrightData API! Visit /api-docs for documentation.');
    });

    it('should respect rate limiting', async () => {
      // Make multiple requests quickly to test rate limiting
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 102; i++) { // Exceed the default rate limit of 100
        requests.push(request(app.getHttpServer()).get('/'));
      }

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (response): response is PromiseFulfilledResult<request.Response> => 
          response.status === 'fulfilled' && response.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('services');
        });
    });

    it('should respect health endpoint rate limiting', async () => {
      // Make requests quickly to test health endpoint rate limiting (60 per minute)
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 65; i++) { // Exceed the health rate limit of 60
        requests.push(request(app.getHttpServer()).get('/health'));
      }

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (response): response is PromiseFulfilledResult<request.Response> => 
          response.status === 'fulfilled' && response.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api-docs')
        .expect(200)
        .expect('Content-Type', /text\/html/);
    });

    it('should serve Swagger JSON', () => {
      return request(app.getHttpServer())
        .get('/api-docs-json')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
  });
});
