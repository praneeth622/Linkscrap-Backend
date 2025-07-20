import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { PeopleProfileDiscoverService } from './people-profile-discover.service';
import { PeopleProfileDiscoverController } from './people-profile-discover.controller';
import { PeopleProfileDiscover } from './entities/people-profile-discover.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeopleProfileDiscover]),
    BrightdataModule,
  ],
  controllers: [PeopleProfileDiscoverController],
  providers: [PeopleProfileDiscoverService],
  exports: [PeopleProfileDiscoverService],
})
export class PeopleProfileDiscoverModule {}
