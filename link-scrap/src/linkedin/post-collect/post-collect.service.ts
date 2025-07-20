import { Injectable } from '@nestjs/common';
import { CreatePostCollectDto } from './dto/create-post-collect.dto';
import { UpdatePostCollectDto } from './dto/update-post-collect.dto';

@Injectable()
export class PostCollectService {
  create(createPostCollectDto: CreatePostCollectDto) {
    return 'This action adds a new postCollect';
  }

  findAll() {
    return `This action returns all postCollect`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postCollect`;
  }

  update(id: number, updatePostCollectDto: UpdatePostCollectDto) {
    return `This action updates a #${id} postCollect`;
  }

  remove(id: number) {
    return `This action removes a #${id} postCollect`;
  }
}
