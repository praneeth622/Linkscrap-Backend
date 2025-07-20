import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';
import { CreateJobListingDiscoverUrlDto } from './dto/create-job-listing-discover-url.dto';
import { UpdateJobListingDiscoverUrlDto } from './dto/update-job-listing-discover-url.dto';

@Controller('job-listing-discover-url')
export class JobListingDiscoverUrlController {
  constructor(private readonly jobListingDiscoverUrlService: JobListingDiscoverUrlService) {}

  @Post()
  create(@Body() createJobListingDiscoverUrlDto: CreateJobListingDiscoverUrlDto) {
    return this.jobListingDiscoverUrlService.create(createJobListingDiscoverUrlDto);
  }

  @Get()
  findAll() {
    return this.jobListingDiscoverUrlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobListingDiscoverUrlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobListingDiscoverUrlDto: UpdateJobListingDiscoverUrlDto) {
    return this.jobListingDiscoverUrlService.update(+id, updateJobListingDiscoverUrlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListingDiscoverUrlService.remove(+id);
  }
}
