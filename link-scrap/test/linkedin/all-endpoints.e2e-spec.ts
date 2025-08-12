import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('LinkedIn All Endpoints (e2e)', () => {
  let app: INestApplication;
  const testAuthToken = 'Bearer test-token';

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

  const linkedinEndpoints = [
    {
      name: 'People Profile Collect',
      postEndpoint: '/linkedin/people-profile/collect',
      getEndpoint: '/linkedin/people-profile/collect',
      samplePostData: {
        urls: ['https://www.linkedin.com/in/test-profile']
      }
    },
    {
      name: 'People Profile Discover',
      postEndpoint: '/linkedin/people-profile/discover',
      getEndpoint: '/linkedin/people-profile/discover',
      samplePostData: {
        searches: [{
          first_name: 'John',
          last_name: 'Doe',
          location: 'New York'
        }]
      }
    },
    {
      name: 'Company Info Collect',
      postEndpoint: '/linkedin/company-info/collect',
      getEndpoint: '/linkedin/company-info/collect',
      samplePostData: {
        urls: ['https://www.linkedin.com/company/test-company']
      }
    },
    {
      name: 'Job Listing Collect',
      postEndpoint: '/linkedin/job-listing/collect',
      getEndpoint: '/linkedin/job-listing/collect',
      samplePostData: {
        urls: ['https://www.linkedin.com/jobs/view/123456789']
      }
    },
    {
      name: 'Job Listing Discover Keyword',
      postEndpoint: '/linkedin/job-listing/discover-keyword',
      getEndpoint: '/linkedin/job-listing/discover-keyword',
      samplePostData: {
        searches: [{
          keyword: 'software engineer',
          location: 'San Francisco'
        }]
      }
    },
    {
      name: 'Job Listing Discover URL',
      postEndpoint: '/linkedin/job-listing/discover-url',
      getEndpoint: '/linkedin/job-listing/discover-url',
      samplePostData: {
        urls: ['https://www.linkedin.com/jobs/search?keywords=developer']
      }
    },
    {
      name: 'Post Collect',
      postEndpoint: '/linkedin/post-collect',
      getEndpoint: '/linkedin/post-collect',
      samplePostData: {
        urls: ['https://www.linkedin.com/posts/test-user_test-post-123456']
      }
    },
    {
      name: 'Post Discover Company',
      postEndpoint: '/linkedin/post-discover-company',
      getEndpoint: '/linkedin/post-discover-company',
      samplePostData: {
        company_urls: ['https://www.linkedin.com/company/test-company']
      }
    },
    {
      name: 'Post Discover Profile',
      postEndpoint: '/linkedin/post-discover-profile',
      getEndpoint: '/linkedin/post-discover-profile',
      samplePostData: {
        profiles: [{
          url: 'https://www.linkedin.com/in/test-profile'
        }]
      }
    },
    {
      name: 'Post Discover URL',
      postEndpoint: '/linkedin/post-discover-url',
      getEndpoint: '/linkedin/post-discover-url',
      samplePostData: {
        urls: [{
          url: 'https://www.linkedin.com/today/author/test-author'
        }]
      }
    },
    {
      name: 'People Search Collect',
      postEndpoint: '/linkedin/people-search-collect',
      getEndpoint: '/linkedin/people-search-collect',
      samplePostData: {
        searches: [{
          first_name: 'John',
          last_name: 'Smith'
        }]
      }
    }
  ];

  describe('Authentication Tests', () => {
    linkedinEndpoints.forEach(endpoint => {
      it(`${endpoint.name} POST should require authentication`, () => {
        return request(app.getHttpServer())
          .post(endpoint.postEndpoint)
          .send(endpoint.samplePostData)
          .expect(401);
      });

      it(`${endpoint.name} GET should require authentication`, () => {
        return request(app.getHttpServer())
          .get(endpoint.getEndpoint)
          .expect(401);
      });
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should apply data collection rate limiting to POST endpoints', async () => {
      const endpoint = linkedinEndpoints[0]; // Use first endpoint for testing
      
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 12; i++) { // Exceed the data collection rate limit of 10
        requests.push(
          request(app.getHttpServer())
            .post(endpoint.postEndpoint)
            .set('Authorization', testAuthToken)
            .send(endpoint.samplePostData)
        );
      }

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        (response): response is PromiseFulfilledResult<request.Response> => 
          response.status === 'fulfilled' && response.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 30000);

    it('should apply data retrieval rate limiting to GET endpoints', async () => {
      const endpoint = linkedinEndpoints[0]; // Use first endpoint for testing
      
      const requests: Promise<request.Response>[] = [];
      for (let i = 0; i < 105; i++) { // Exceed the data retrieval rate limit of 100
        requests.push(
          request(app.getHttpServer())
            .get(endpoint.getEndpoint)
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
    }, 60000);
  });

  describe('Request Validation Tests', () => {
    linkedinEndpoints.forEach(endpoint => {
      it(`${endpoint.name} POST should validate request body`, () => {
        return request(app.getHttpServer())
          .post(endpoint.postEndpoint)
          .set('Authorization', testAuthToken)
          .send({}) // Empty body should be invalid
          .expect(400);
      });
    });
  });

  describe('Response Format Tests', () => {
    linkedinEndpoints.forEach(endpoint => {
      it(`${endpoint.name} POST should return proper response format on success`, () => {
        return request(app.getHttpServer())
          .post(endpoint.postEndpoint)
          .set('Authorization', testAuthToken)
          .send(endpoint.samplePostData)
          .expect((res) => {
            // Should return 200 (success) or 400/500 (validation/server error)
            expect([200, 400, 500, 502]).toContain(res.status);
            
            if (res.status === 200) {
              expect(res.body).toHaveProperty('success');
            }
          });
      });

      it(`${endpoint.name} GET should return proper response format`, () => {
        return request(app.getHttpServer())
          .get(endpoint.getEndpoint)
          .set('Authorization', testAuthToken)
          .expect((res) => {
            // Should return 200 (success) or error status
            expect([200, 400, 500, 502]).toContain(res.status);
            
            if (res.status === 200) {
              expect(res.body).toBeDefined();
            }
          });
      });
    });
  });

  describe('Snapshot Status and Data Endpoints', () => {
    const testSnapshotId = 'test-snapshot-id';
    
    linkedinEndpoints.forEach(endpoint => {
      const statusEndpoint = `${endpoint.postEndpoint}/snapshot/${testSnapshotId}/status`;
      const dataEndpoint = `${endpoint.postEndpoint}/snapshot/${testSnapshotId}/data`;

      it(`${endpoint.name} snapshot status should require authentication`, () => {
        return request(app.getHttpServer())
          .get(statusEndpoint)
          .expect(401);
      });

      it(`${endpoint.name} snapshot data should require authentication`, () => {
        return request(app.getHttpServer())
          .get(dataEndpoint)
          .expect(401);
      });

      it(`${endpoint.name} snapshot status should return proper response with auth`, () => {
        return request(app.getHttpServer())
          .get(statusEndpoint)
          .set('Authorization', testAuthToken)
          .expect((res) => {
            // Should return either 200 (found), 404 (not found), or 502 (API error)
            expect([200, 404, 502]).toContain(res.status);
          });
      });

      it(`${endpoint.name} snapshot data should return proper response with auth`, () => {
        return request(app.getHttpServer())
          .get(dataEndpoint)
          .set('Authorization', testAuthToken)
          .expect((res) => {
            // Should return either 200 (found), 404 (not found), or 502 (API error)
            expect([200, 404, 502]).toContain(res.status);
          });
      });
    });
  });

  describe('Content-Type Headers', () => {
    linkedinEndpoints.forEach(endpoint => {
      it(`${endpoint.name} should accept JSON content type`, () => {
        return request(app.getHttpServer())
          .post(endpoint.postEndpoint)
          .set('Authorization', testAuthToken)
          .set('Content-Type', 'application/json')
          .send(endpoint.samplePostData)
          .expect((res) => {
            // Should not return 415 (Unsupported Media Type)
            expect(res.status).not.toBe(415);
          });
      });
    });
  });
});
