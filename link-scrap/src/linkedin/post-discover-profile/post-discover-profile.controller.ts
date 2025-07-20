import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostDiscoverProfileService } from './post-discover-profile.service';
import { CreatePostDiscoverProfileDto } from './dto/create-post-discover-profile.dto';
import { UpdatePostDiscoverProfileDto } from './dto/update-post-discover-profile.dto';

@Controller('post-discover-profile')
export class PostDiscoverProfileController {
  constructor(private readonly postDiscoverProfileService: PostDiscoverProfileService) {}

  @Post()
  create(@Body() createPostDiscoverProfileDto: CreatePostDiscoverProfileDto) {
    return this.postDiscoverProfileService.create(createPostDiscoverProfileDto);
  }

  @Get()
  findAll() {
    return this.postDiscoverProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postDiscoverProfileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDiscoverProfileDto: UpdatePostDiscoverProfileDto) {
    return this.postDiscoverProfileService.update(+id, updatePostDiscoverProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postDiscoverProfileService.remove(+id);
  }
}
