import { Test, TestingModule } from '@nestjs/testing';
import { PeopleSearchController } from './people-search.controller';
import { PeopleSearchService } from './people-search.service';

describe('PeopleSearchController', () => {
  let controller: PeopleSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeopleSearchController],
      providers: [PeopleSearchService],
    }).compile();

    controller = module.get<PeopleSearchController>(PeopleSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
