import { Injectable } from '@nestjs/common';
import { CreateJobListingCollectDto } from './dto/create-job-listing-collect.dto';
import { UpdateJobListingCollectDto } from './dto/update-job-listing-collect.dto';

@Injectable()
export class JobListingCollectService {
  create(createJobListingCollectDto: CreateJobListingCollectDto) {
    return 'This action adds a new jobListingCollect';
  }

  findAll() {
    return `This action returns all jobListingCollect`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobListingCollect`;
  }

  update(id: number, updateJobListingCollectDto: UpdateJobListingCollectDto) {
    return `This action updates a #${id} jobListingCollect`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobListingCollect`;
  }
}
