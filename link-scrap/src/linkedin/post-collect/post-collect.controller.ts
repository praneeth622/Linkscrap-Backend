import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostCollectService } from './post-collect.service';
import { CreatePostCollectDto } from './dto/create-post-collect.dto';
import { UpdatePostCollectDto } from './dto/update-post-collect.dto';

@Controller('post-collect')
export class PostCollectController {
  constructor(private readonly postCollectService: PostCollectService) {}

  @Post()
  create(@Body() createPostCollectDto: CreatePostCollectDto) {
    return this.postCollectService.create(createPostCollectDto);
  }

  @Get()
  findAll() {
    return this.postCollectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postCollectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostCollectDto: UpdatePostCollectDto) {
    return this.postCollectService.update(+id, updatePostCollectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postCollectService.remove(+id);
  }
}
