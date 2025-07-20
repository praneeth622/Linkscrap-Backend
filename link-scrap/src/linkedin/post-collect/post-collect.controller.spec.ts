import { Test, TestingModule } from '@nestjs/testing';
import { PostCollectController } from './post-collect.controller';
import { PostCollectService } from './post-collect.service';

describe('PostCollectController', () => {
  let controller: PostCollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCollectController],
      providers: [PostCollectService],
    }).compile();

    controller = module.get<PostCollectController>(PostCollectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
