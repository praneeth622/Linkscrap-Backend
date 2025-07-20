import { Module } from '@nestjs/common';
import { CompanyInfoCollectService } from './company-info-collect.service';
import { CompanyInfoCollectController } from './company-info-collect.controller';

@Module({
  controllers: [CompanyInfoCollectController],
  providers: [CompanyInfoCollectService],
})
export class CompanyInfoCollectModule {}
