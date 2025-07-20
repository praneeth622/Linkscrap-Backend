import { Injectable } from '@nestjs/common';
import { CreateJobListingDiscoverUrlDto } from './dto/create-job-listing-discover-url.dto';
import { UpdateJobListingDiscoverUrlDto } from './dto/update-job-listing-discover-url.dto';

@Injectable()
export class JobListingDiscoverUrlService {
  create(createJobListingDiscoverUrlDto: CreateJobListingDiscoverUrlDto) {
    return 'This action adds a new jobListingDiscoverUrl';
  }

  findAll() {
    return `This action returns all jobListingDiscoverUrl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobListingDiscoverUrl`;
  }

  update(id: number, updateJobListingDiscoverUrlDto: UpdateJobListingDiscoverUrlDto) {
    return `This action updates a #${id} jobListingDiscoverUrl`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobListingDiscoverUrl`;
  }
}
