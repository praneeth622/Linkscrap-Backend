import { Test, TestingModule } from '@nestjs/testing';
import { PostDiscoverCompanyService } from './post-discover-company.service';

describe('PostDiscoverCompanyService', () => {
  let service: PostDiscoverCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostDiscoverCompanyService],
    }).compile();

    service = module.get<PostDiscoverCompanyService>(PostDiscoverCompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
