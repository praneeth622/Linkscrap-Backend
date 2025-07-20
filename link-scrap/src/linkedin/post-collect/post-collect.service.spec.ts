import { Test, TestingModule } from '@nestjs/testing';
import { PostCollectService } from './post-collect.service';

describe('PostCollectService', () => {
  let service: PostCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostCollectService],
    }).compile();

    service = module.get<PostCollectService>(PostCollectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
