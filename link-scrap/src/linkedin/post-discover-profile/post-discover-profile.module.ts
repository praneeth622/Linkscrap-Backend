import { Module } from '@nestjs/common';
import { PostDiscoverProfileService } from './post-discover-profile.service';
import { PostDiscoverProfileController } from './post-discover-profile.controller';

@Module({
  controllers: [PostDiscoverProfileController],
  providers: [PostDiscoverProfileService],
})
export class PostDiscoverProfileModule {}
