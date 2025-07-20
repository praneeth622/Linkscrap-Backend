import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverUrlService } from './post-discover-url.service';

describe('PostDiscoverUrlService', () => {
  let service: PostDiscoverUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostDiscoverUrlService],
    }).compile();

    service = module.get<PostDiscoverUrlService>(PostDiscoverUrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
