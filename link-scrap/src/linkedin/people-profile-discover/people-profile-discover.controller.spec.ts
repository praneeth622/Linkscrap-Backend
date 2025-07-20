import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileDiscoverController } from './people-profile-discover.controller';
import { PeopleProfileDiscoverService } from './people-profile-discover.service';

describe('PeopleProfileDiscoverController', () => {
  let controller: PeopleProfileDiscoverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeopleProfileDiscoverController],
      providers: [PeopleProfileDiscoverService],
    }).compile();

    controller = module.get<PeopleProfileDiscoverController>(PeopleProfileDiscoverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
