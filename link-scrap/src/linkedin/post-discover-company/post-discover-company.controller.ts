import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostDiscoverCompanyService } from './post-discover-company.service';
import { CreatePostDiscoverCompanyDto } from './dto/create-post-discover-company.dto';
import { UpdatePostDiscoverCompanyDto } from './dto/update-post-discover-company.dto';

@Controller('post-discover-company')
export class PostDiscoverCompanyController {
  constructor(private readonly postDiscoverCompanyService: PostDiscoverCompanyService) {}

  @Post()
  create(@Body() createPostDiscoverCompanyDto: CreatePostDiscoverCompanyDto) {
    return this.postDiscoverCompanyService.create(createPostDiscoverCompanyDto);
  }

  @Get()
  findAll() {
    return this.postDiscoverCompanyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postDiscoverCompanyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDiscoverCompanyDto: UpdatePostDiscoverCompanyDto) {
    return this.postDiscoverCompanyService.update(+id, updatePostDiscoverCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postDiscoverCompanyService.remove(+id);
  }
}
