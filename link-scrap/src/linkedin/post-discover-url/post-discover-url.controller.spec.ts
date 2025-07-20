import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverUrlController } from './post-discover-url.controller';
import { PostDiscoverUrlService } from './post-discover-url.service';

describe('PostDiscoverUrlController', () => {
  let controller: PostDiscoverUrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostDiscoverUrlController],
      providers: [PostDiscoverUrlService],
    }).compile();

    controller = module.get<PostDiscoverUrlController>(PostDiscoverUrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
