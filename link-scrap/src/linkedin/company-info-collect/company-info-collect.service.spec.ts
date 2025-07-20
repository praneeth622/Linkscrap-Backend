import { Test, TestingModule } from '@nestjs/testing';
import { CompanyInfoCollectService } from './company-info-collect.service';

describe('CompanyInfoCollectService', () => {
  let service: CompanyInfoCollectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyInfoCollectService],
    }).compile();

    service = module.get<CompanyInfoCollectService>(CompanyInfoCollectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
