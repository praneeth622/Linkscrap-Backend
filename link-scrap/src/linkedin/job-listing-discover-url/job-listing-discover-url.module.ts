import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';
import { JobListingDiscoverUrlController } from './job-listing-discover-url.controller';
import { JobListingDiscoverUrl } from './entities/job-listing-discover-url.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobListingDiscoverUrl]),
    BrightdataModule,
  ],
  controllers: [JobListingDiscoverUrlController],
  providers: [JobListingDiscoverUrlService],
  exports: [JobListingDiscoverUrlService],
})
export class JobListingDiscoverUrlModule {}
