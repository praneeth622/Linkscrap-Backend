import { Test, TestingModule } from '@nestjs/testing';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';

describe('JobListingDiscoverKeywordService', () => {
  let service: JobListingDiscoverKeywordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobListingDiscoverKeywordService],
    }).compile();

    service = module.get<JobListingDiscoverKeywordService>(JobListingDiscoverKeywordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
