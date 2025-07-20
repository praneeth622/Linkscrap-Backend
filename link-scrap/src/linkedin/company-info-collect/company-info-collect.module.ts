import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInfoCollectService } from './company-info-collect.service';
import { CompanyInfoCollectController } from './company-info-collect.controller';
import { CompanyInfoEntity } from './entities';
import { BrightdataModule } from '../../brightdata/brightdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyInfoEntity]),
    BrightdataModule,
  ],
  controllers: [CompanyInfoCollectController],
  providers: [CompanyInfoCollectService],
  exports: [CompanyInfoCollectService],
})
export class CompanyInfoCollectModule {}
