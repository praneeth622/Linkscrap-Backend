import { Module } from '@nestjs/common';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';
import { JobListingDiscoverUrlController } from './job-listing-discover-url.controller';

@Module({
  controllers: [JobListingDiscoverUrlController],
  providers: [JobListingDiscoverUrlService],
})
export class JobListingDiscoverUrlModule {}
