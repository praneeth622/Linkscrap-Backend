import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleSearchCollectService } from './people-search-collect.service';
import { PeopleSearchCollectController } from './people-search-collect.controller';
import { LinkedInPeopleSearch } from './entities/linkedin-people-search.entity';
import { BrightdataModule } from '../../brightdata/brightdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInPeopleSearch]),
    BrightdataModule,
  ],
  controllers: [PeopleSearchCollectController],
  providers: [PeopleSearchCollectService],
  exports: [PeopleSearchCollectService],
})
export class PeopleSearchCollectModule {}
