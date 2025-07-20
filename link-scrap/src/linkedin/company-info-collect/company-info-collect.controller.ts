import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompanyInfoCollectService } from './company-info-collect.service';
import { CreateCompanyInfoCollectDto } from './dto/create-company-info-collect.dto';
import { UpdateCompanyInfoCollectDto } from './dto/update-company-info-collect.dto';

@Controller('company-info-collect')
export class CompanyInfoCollectController {
  constructor(private readonly companyInfoCollectService: CompanyInfoCollectService) {}

  @Post()
  create(@Body() createCompanyInfoCollectDto: CreateCompanyInfoCollectDto) {
    return this.companyInfoCollectService.create(createCompanyInfoCollectDto);
  }

  @Get()
  findAll() {
    return this.companyInfoCollectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyInfoCollectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyInfoCollectDto: UpdateCompanyInfoCollectDto) {
    return this.companyInfoCollectService.update(+id, updateCompanyInfoCollectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyInfoCollectService.remove(+id);
  }
}
