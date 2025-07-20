import { Injectable } from '@nestjs/common';
import { CreateCompanyInfoCollectDto } from './dto/create-company-info-collect.dto';
import { UpdateCompanyInfoCollectDto } from './dto/update-company-info-collect.dto';

@Injectable()
export class CompanyInfoCollectService {
  create(createCompanyInfoCollectDto: CreateCompanyInfoCollectDto) {
    return 'This action adds a new companyInfoCollect';
  }

  findAll() {
    return `This action returns all companyInfoCollect`;
  }

  findOne(id: number) {
    return `This action returns a #${id} companyInfoCollect`;
  }

  update(id: number, updateCompanyInfoCollectDto: UpdateCompanyInfoCollectDto) {
    return `This action updates a #${id} companyInfoCollect`;
  }

  remove(id: number) {
    return `This action removes a #${id} companyInfoCollect`;
  }
}
