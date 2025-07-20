import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PeopleSearchService } from './people-search.service';
import { CreatePeopleSearchDto } from './dto/create-people-search.dto';
import { UpdatePeopleSearchDto } from './dto/update-people-search.dto';

@Controller('people-search')
export class PeopleSearchController {
  constructor(private readonly peopleSearchService: PeopleSearchService) {}

  @Post()
  create(@Body() createPeopleSearchDto: CreatePeopleSearchDto) {
    return this.peopleSearchService.create(createPeopleSearchDto);
  }

  @Get()
  findAll() {
    return this.peopleSearchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.peopleSearchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePeopleSearchDto: UpdatePeopleSearchDto) {
    return this.peopleSearchService.update(+id, updatePeopleSearchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.peopleSearchService.remove(+id);
  }
}
