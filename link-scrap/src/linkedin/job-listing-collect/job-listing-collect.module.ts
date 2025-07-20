import { Module } from '@nestjs/common';
import { JobListingCollectService } from './job-listing-collect.service';
import { JobListingCollectController } from './job-listing-collect.controller';

@Module({
  controllers: [JobListingCollectController],
  providers: [JobListingCollectService],
})
export class JobListingCollectModule {}
