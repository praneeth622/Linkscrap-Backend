import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostDiscoverUrlService } from './post-discover-url.service';
import { PostDiscoverUrlController } from './post-discover-url.controller';
import { LinkedInPostDiscoverUrl } from './entities/linkedin-post-discover-url.entity';
import { BrightdataModule } from '../../brightdata/brightdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInPostDiscoverUrl]),
    BrightdataModule,
  ],
  controllers: [PostDiscoverUrlController],
  providers: [PostDiscoverUrlService],
  exports: [PostDiscoverUrlService],
})
export class PostDiscoverUrlModule {}
