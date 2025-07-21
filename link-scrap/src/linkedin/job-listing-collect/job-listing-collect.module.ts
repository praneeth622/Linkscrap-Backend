import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { JobListingCollectService } from './job-listing-collect.service';
import { JobListingCollectController } from './job-listing-collect.controller';
import { JobListing } from './entities/job-listing-collect.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobListing]),
    BrightdataModule,
  ],
  controllers: [JobListingCollectController],
  providers: [JobListingCollectService],
  exports: [JobListingCollectService],
})
export class JobListingCollectModule {}
