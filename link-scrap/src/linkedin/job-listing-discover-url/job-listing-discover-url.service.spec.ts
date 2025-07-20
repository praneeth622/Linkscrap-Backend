import { Test, TestingModule } from '@nestjs/testing';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';

describe('JobListingDiscoverUrlService', () => {
  let service: JobListingDiscoverUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobListingDiscoverUrlService],
    }).compile();

    service = module.get<JobListingDiscoverUrlService>(JobListingDiscoverUrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
