import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileCollectService } from './people-profile-collect.service';

describe('PeopleProfileCollectService', () => {
  let service: PeopleProfileCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeopleProfileCollectService],
    }).compile();

    service = module.get<PeopleProfileCollectService>(PeopleProfileCollectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
