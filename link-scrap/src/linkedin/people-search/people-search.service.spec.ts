import { Test, TestingModule } from '@nestjs/testing';
import { PeopleSearchService } from './people-search.service';

describe('PeopleSearchService', () => {
  let service: PeopleSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeopleSearchService],
    }).compile();

    service = module.get<PeopleSearchService>(PeopleSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
