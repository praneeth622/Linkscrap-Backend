import { Module } from '@nestjs/common';
import { PeopleSearchService } from './people-search.service';
import { PeopleSearchController } from './people-search.controller';

@Module({
  controllers: [PeopleSearchController],
  providers: [PeopleSearchService],
})
export class PeopleSearchModule {}
