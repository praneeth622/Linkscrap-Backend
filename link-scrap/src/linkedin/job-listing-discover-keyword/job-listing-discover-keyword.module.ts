import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';
import { JobListingDiscoverKeywordController } from './job-listing-discover-keyword.controller';
import { JobListingDiscover } from './entities/job-listing-discover-keyword.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobListingDiscover]),
    BrightdataModule,
  ],
  controllers: [JobListingDiscoverKeywordController],
  providers: [JobListingDiscoverKeywordService],
  exports: [JobListingDiscoverKeywordService],
})
export class JobListingDiscoverKeywordModule {}
