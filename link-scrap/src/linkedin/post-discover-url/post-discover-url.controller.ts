import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostDiscoverUrlService } from './post-discover-url.service';
import { CreatePostDiscoverUrlDto } from './dto/create-post-discover-url.dto';
import { UpdatePostDiscoverUrlDto } from './dto/update-post-discover-url.dto';

@Controller('post-discover-url')
export class PostDiscoverUrlController {
  constructor(private readonly postDiscoverUrlService: PostDiscoverUrlService) {}

  @Post()
  create(@Body() createPostDiscoverUrlDto: CreatePostDiscoverUrlDto) {
    return this.postDiscoverUrlService.create(createPostDiscoverUrlDto);
  }

  @Get()
  findAll() {
    return this.postDiscoverUrlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postDiscoverUrlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDiscoverUrlDto: UpdatePostDiscoverUrlDto) {
    return this.postDiscoverUrlService.update(+id, updatePostDiscoverUrlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postDiscoverUrlService.remove(+id);
  }
}
