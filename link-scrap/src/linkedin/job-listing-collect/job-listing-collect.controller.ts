import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobListingCollectService } from './job-listing-collect.service';
import { CreateJobListingCollectDto } from './dto/create-job-listing-collect.dto';
import { UpdateJobListingCollectDto } from './dto/update-job-listing-collect.dto';

@Controller('job-listing-collect')
export class JobListingCollectController {
  constructor(private readonly jobListingCollectService: JobListingCollectService) {}

  @Post()
  create(@Body() createJobListingCollectDto: CreateJobListingCollectDto) {
    return this.jobListingCollectService.create(createJobListingCollectDto);
  }

  @Get()
  findAll() {
    return this.jobListingCollectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobListingCollectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobListingCollectDto: UpdateJobListingCollectDto) {
    return this.jobListingCollectService.update(+id, updateJobListingCollectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListingCollectService.remove(+id);
  }
}
