import { Module } from '@nestjs/common';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';
import { JobListingDiscoverKeywordController } from './job-listing-discover-keyword.controller';

@Module({
  controllers: [JobListingDiscoverKeywordController],
  providers: [JobListingDiscoverKeywordService],
})
export class JobListingDiscoverKeywordModule {}
