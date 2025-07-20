import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileDiscoverService } from './people-profile-discover.service';

describe('PeopleProfileDiscoverService', () => {
  let service: PeopleProfileDiscoverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeopleProfileDiscoverService],
    }).compile();

    service = module.get<PeopleProfileDiscoverService>(PeopleProfileDiscoverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
