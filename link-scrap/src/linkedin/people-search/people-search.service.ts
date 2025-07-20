import { Injectable } from '@nestjs/common';
import { CreatePeopleSearchDto } from './dto/create-people-search.dto';
import { UpdatePeopleSearchDto } from './dto/update-people-search.dto';

@Injectable()
export class PeopleSearchService {
  create(createPeopleSearchDto: CreatePeopleSearchDto) {
    return 'This action adds a new peopleSearch';
  }

  findAll() {
    return `This action returns all peopleSearch`;
  }

  findOne(id: number) {
    return `This action returns a #${id} peopleSearch`;
  }

  update(id: number, updatePeopleSearchDto: UpdatePeopleSearchDto) {
    return `This action updates a #${id} peopleSearch`;
  }

  remove(id: number) {
    return `This action removes a #${id} peopleSearch`;
  }
}
