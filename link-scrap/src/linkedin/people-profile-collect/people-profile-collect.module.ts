import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { PeopleProfileCollectService } from './people-profile-collect.service';
import { PeopleProfileCollectController } from './people-profile-collect.controller';
import { PeopleProfile } from './entities/people-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PeopleProfile]),
    BrightdataModule,
  ],
  controllers: [PeopleProfileCollectController],
  providers: [PeopleProfileCollectService],
  exports: [PeopleProfileCollectService],
})
export class PeopleProfileCollectModule {}
