import { Injectable } from '@nestjs/common';
import { CreatePostDiscoverProfileDto } from './dto/create-post-discover-profile.dto';
import { UpdatePostDiscoverProfileDto } from './dto/update-post-discover-profile.dto';

@Injectable()
export class PostDiscoverProfileService {
  create(createPostDiscoverProfileDto: CreatePostDiscoverProfileDto) {
    return 'This action adds a new postDiscoverProfile';
  }

  findAll() {
    return `This action returns all postDiscoverProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postDiscoverProfile`;
  }

  update(id: number, updatePostDiscoverProfileDto: UpdatePostDiscoverProfileDto) {
    return `This action updates a #${id} postDiscoverProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} postDiscoverProfile`;
  }
}
