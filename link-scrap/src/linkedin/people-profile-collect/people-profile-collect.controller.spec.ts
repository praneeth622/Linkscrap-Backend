import { Test, TestingModule } from '@nestjs/testing';
import { PeopleProfileCollectController } from './people-profile-collect.controller';
import { PeopleProfileCollectService } from './people-profile-collect.service';

describe('PeopleProfileCollectController', () => {
  let controller: PeopleProfileCollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeopleProfileCollectController],
      providers: [PeopleProfileCollectService],
    }).compile();

    controller = module.get<PeopleProfileCollectController>(PeopleProfileCollectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
