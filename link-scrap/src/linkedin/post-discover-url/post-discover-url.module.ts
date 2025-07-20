import { Module } from '@nestjs/common';
import { PostDiscoverUrlService } from './post-discover-url.service';
import { PostDiscoverUrlController } from './post-discover-url.controller';

@Module({
  controllers: [PostDiscoverUrlController],
  providers: [PostDiscoverUrlService],
})
export class PostDiscoverUrlModule {}
