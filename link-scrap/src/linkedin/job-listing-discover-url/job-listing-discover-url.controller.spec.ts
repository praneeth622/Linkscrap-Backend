import { Test, TestingModule } from '@nestjs/testing';
import { JobListingDiscoverUrlController } from './job-listing-discover-url.controller';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';

describe('JobListingDiscoverUrlController', () => {
  let controller: JobListingDiscoverUrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobListingDiscoverUrlController],
      providers: [JobListingDiscoverUrlService],
    }).compile();

    controller = module.get<JobListingDiscoverUrlController>(JobListingDiscoverUrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
