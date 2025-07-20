import { Test, TestingModule } from '@nestjs/testing';
import { JobListingCollectController } from './job-listing-collect.controller';
import { JobListingCollectService } from './job-listing-collect.service';

describe('JobListingCollectController', () => {
  let controller: JobListingCollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobListingCollectController],
      providers: [JobListingCollectService],
    }).compile();

    controller = module.get<JobListingCollectController>(JobListingCollectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
