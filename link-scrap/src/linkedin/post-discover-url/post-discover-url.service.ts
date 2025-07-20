import { Injectable } from '@nestjs/common';
import { CreatePostDiscoverUrlDto } from './dto/create-post-discover-url.dto';
import { UpdatePostDiscoverUrlDto } from './dto/update-post-discover-url.dto';

@Injectable()
export class PostDiscoverUrlService {
  create(createPostDiscoverUrlDto: CreatePostDiscoverUrlDto) {
    return 'This action adds a new postDiscoverUrl';
  }

  findAll() {
    return `This action returns all postDiscoverUrl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postDiscoverUrl`;
  }

  update(id: number, updatePostDiscoverUrlDto: UpdatePostDiscoverUrlDto) {
    return `This action updates a #${id} postDiscoverUrl`;
  }

  remove(id: number) {
    return `This action removes a #${id} postDiscoverUrl`;
  }
}
