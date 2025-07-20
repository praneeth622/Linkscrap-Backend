import { Injectable } from '@nestjs/common';
import { CreateJobListingDiscoverKeywordDto } from './dto/create-job-listing-discover-keyword.dto';
import { UpdateJobListingDiscoverKeywordDto } from './dto/update-job-listing-discover-keyword.dto';

@Injectable()
export class JobListingDiscoverKeywordService {
  create(createJobListingDiscoverKeywordDto: CreateJobListingDiscoverKeywordDto) {
    return 'This action adds a new jobListingDiscoverKeyword';
  }

  findAll() {
    return `This action returns all jobListingDiscoverKeyword`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobListingDiscoverKeyword`;
  }

  update(id: number, updateJobListingDiscoverKeywordDto: UpdateJobListingDiscoverKeywordDto) {
    return `This action updates a #${id} jobListingDiscoverKeyword`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobListingDiscoverKeyword`;
  }
}
