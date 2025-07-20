import { Test, TestingModule } from '@nestjs/testing';
import { JobListingDiscoverKeywordController } from './job-listing-discover-keyword.controller';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';

describe('JobListingDiscoverKeywordController', () => {
  let controller: JobListingDiscoverKeywordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobListingDiscoverKeywordController],
      providers: [JobListingDiscoverKeywordService],
    }).compile();

    controller = module.get<JobListingDiscoverKeywordController>(JobListingDiscoverKeywordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
