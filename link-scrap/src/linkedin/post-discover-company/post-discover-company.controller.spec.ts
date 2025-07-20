import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverCompanyController } from './post-discover-company.controller';
import { PostDiscoverCompanyService } from './post-discover-company.service';

describe('PostDiscoverCompanyController', () => {
  let controller: PostDiscoverCompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostDiscoverCompanyController],
      providers: [PostDiscoverCompanyService],
    }).compile();

    controller = module.get<PostDiscoverCompanyController>(PostDiscoverCompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
