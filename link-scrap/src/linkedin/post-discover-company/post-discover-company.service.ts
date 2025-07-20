import { Injectable } from '@nestjs/common';
import { CreatePostDiscoverCompanyDto } from './dto/create-post-discover-company.dto';
import { UpdatePostDiscoverCompanyDto } from './dto/update-post-discover-company.dto';

@Injectable()
export class PostDiscoverCompanyService {
  create(createPostDiscoverCompanyDto: CreatePostDiscoverCompanyDto) {
    return 'This action adds a new postDiscoverCompany';
  }

  findAll() {
    return `This action returns all postDiscoverCompany`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postDiscoverCompany`;
  }

  update(id: number, updatePostDiscoverCompanyDto: UpdatePostDiscoverCompanyDto) {
    return `This action updates a #${id} postDiscoverCompany`;
  }

  remove(id: number) {
    return `This action removes a #${id} postDiscoverCompany`;
  }
}
