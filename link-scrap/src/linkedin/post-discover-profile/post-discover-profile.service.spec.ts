import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverProfileService } from './post-discover-profile.service';

describe('PostDiscoverProfileService', () => {
  let service: PostDiscoverProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostDiscoverProfileService],
    }).compile();

    service = module.get<PostDiscoverProfileService>(PostDiscoverProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
