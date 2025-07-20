import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';
import { CreateJobListingDiscoverKeywordDto } from './dto/create-job-listing-discover-keyword.dto';
import { UpdateJobListingDiscoverKeywordDto } from './dto/update-job-listing-discover-keyword.dto';

@Controller('job-listing-discover-keyword')
export class JobListingDiscoverKeywordController {
  constructor(private readonly jobListingDiscoverKeywordService: JobListingDiscoverKeywordService) {}

  @Post()
  create(@Body() createJobListingDiscoverKeywordDto: CreateJobListingDiscoverKeywordDto) {
    return this.jobListingDiscoverKeywordService.create(createJobListingDiscoverKeywordDto);
  }

  @Get()
  findAll() {
    return this.jobListingDiscoverKeywordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobListingDiscoverKeywordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobListingDiscoverKeywordDto: UpdateJobListingDiscoverKeywordDto) {
    return this.jobListingDiscoverKeywordService.update(+id, updateJobListingDiscoverKeywordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobListingDiscoverKeywordService.remove(+id);
  }
}
