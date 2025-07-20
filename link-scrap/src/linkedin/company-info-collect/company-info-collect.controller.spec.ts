import { Test, TestingModule } from '@nestjs/testing';
import { CompanyInfoCollectController } from './company-info-collect.controller';
import { CompanyInfoCollectService } from './company-info-collect.service';

describe('CompanyInfoCollectController', () => {
  let controller: CompanyInfoCollectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyInfoCollectController],
      providers: [CompanyInfoCollectService],
    }).compile();

    controller = module.get<CompanyInfoCollectController>(CompanyInfoCollectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
