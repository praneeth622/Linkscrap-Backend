import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('LinkedIn People Profile Collect (e2e)', () => {
  let app: INestApplication;
  const testAuthToken = 'Bearer test-token'; // Mock token for testing

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/linkedin/people-profile/collect (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/linkedin/people-profile/collect')
        .send({
          urls: ['https://www.linkedin.com/in/test-profile']
        })
        .expect(401);
    });

    it('should validate request body structure', () => {
      return request(app.getHttpServer())
        .post('/linkedin/people-profile/collect')
        .set('Authorization', testAuthToken)
        .send({
          // Missing urls field
        })
        .expect(400);
    });

    it('should validate URLs format', () => {
      return request(app.getHttpServer())
        .post('/linkedin/people-profile/collect')
        .set('Authorization', testAuthToken)
        .send({
          urls: ['invalid-url']
        })
        .expect(400);
    });

    it('should accept valid LinkedIn URLs', () => {
      return request(app.getHttpServer())
        .post('/linkedin/people-profile/collect')
        .set('Authorization', testAuthToken)
        .send({
          urls: [
            'https://www.linkedin.com/in/test-profile',
            'https://linkedin.com/in/another-profile'
          ]
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
          expect(res.body).toHaveProperty('snapshot_id');
        });
    });

    it('should respect data collection rate limiting', async () => {
      // Make requests quickly to test data collection rate limiting (10 per hour)
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 12; i++) { // Exceed the data collection rate limit of 10
        requests.push(
          request(app.getHttpServer())
            .post('/linkedin/people-profile/collect')
            .set('Authorization', testAuthToken)
            .send({
              urls: ['https://www.linkedin.com/in/test-profile']
            })
        );
      }

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (response): response is PromiseFulfilledResult<request.Response> => 
          response.status === 'fulfilled' && response.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 30000); // Increase timeout for this test
  });

  describe('/linkedin/people-profile/collect (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect')
        .expect(401);
    });

    it('should return profiles with authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect')
        .set('Authorization', testAuthToken)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should respect data retrieval rate limiting', async () => {
      // Make requests quickly to test data retrieval rate limiting (100 per hour)
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 105; i++) { // Exceed the data retrieval rate limit of 100
        requests.push(
          request(app.getHttpServer())
            .get('/linkedin/people-profile/collect')
            .set('Authorization', testAuthToken)
        );
      }

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (response): response is PromiseFulfilledResult<request.Response> => 
          response.status === 'fulfilled' && response.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 60000); // Increase timeout for this test
  });

  describe('/linkedin/people-profile/collect/snapshot/:snapshotId/status (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/snapshot/test-snapshot-id/status')
        .expect(401);
    });

    it('should return snapshot status with authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/snapshot/test-snapshot-id/status')
        .set('Authorization', testAuthToken)
        .expect((res) => {
          // Should return either 200 (found) or 404 (not found)
          expect([200, 404, 502]).toContain(res.status);
        });
    });
  });

  describe('/linkedin/people-profile/collect/snapshot/:snapshotId/data (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/snapshot/test-snapshot-id/data')
        .expect(401);
    });

    it('should return snapshot data with authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/snapshot/test-snapshot-id/data')
        .set('Authorization', testAuthToken)
        .expect((res) => {
          // Should return either 200 (found) or 404 (not found)
          expect([200, 404, 502]).toContain(res.status);
        });
    });
  });

  describe('/linkedin/people-profile/collect/:id (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/test-id')
        .expect(401);
    });

    it('should return profile by ID with authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/test-id')
        .set('Authorization', testAuthToken)
        .expect((res) => {
          // Should return either 200 (found) or 404 (not found)
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('/linkedin/people-profile/collect/linkedin-id/:linkedinId (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/linkedin-id/test-linkedin-id')
        .expect(401);
    });

    it('should return profile by LinkedIn ID with authentication', () => {
      return request(app.getHttpServer())
        .get('/linkedin/people-profile/collect/linkedin-id/test-linkedin-id')
        .set('Authorization', testAuthToken)
        .expect((res) => {
          // Should return either 200 (found) or 404 (not found)
          expect([200, 404]).toContain(res.status);
        });
    });
  });
});
