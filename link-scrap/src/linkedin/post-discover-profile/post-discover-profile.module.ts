import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostDiscoverProfileService } from './post-discover-profile.service';
import { PostDiscoverProfileController } from './post-discover-profile.controller';
import { LinkedInPostDiscoverProfile } from './entities/post-discover-profile.entity';
import { BrightdataModule } from '../../brightdata/brightdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInPostDiscoverProfile]),
    BrightdataModule,
  ],
  controllers: [PostDiscoverProfileController],
  providers: [PostDiscoverProfileService],
  exports: [PostDiscoverProfileService],
})
export class PostDiscoverProfileModule {}
