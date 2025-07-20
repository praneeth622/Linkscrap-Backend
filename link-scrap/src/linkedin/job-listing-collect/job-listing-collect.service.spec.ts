import { Test, TestingModule } from '@nestjs/testing';
import { JobListingCollectService } from './job-listing-collect.service';

describe('JobListingCollectService', () => {
  let service: JobListingCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobListingCollectService],
    }).compile();

    service = module.get<JobListingCollectService>(JobListingCollectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
