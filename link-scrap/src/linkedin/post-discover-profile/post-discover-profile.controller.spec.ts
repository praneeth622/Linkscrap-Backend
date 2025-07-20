import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverProfileController } from './post-discover-profile.controller';
import { PostDiscoverProfileService } from './post-discover-profile.service';

describe('PostDiscoverProfileController', () => {
  let controller: PostDiscoverProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostDiscoverProfileController],
      providers: [PostDiscoverProfileService],
    }).compile();

    controller = module.get<PostDiscoverProfileController>(PostDiscoverProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
