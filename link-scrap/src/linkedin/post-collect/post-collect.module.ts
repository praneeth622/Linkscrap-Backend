import { Module } from '@nestjs/common';
import { PostCollectService } from './post-collect.service';
import { PostCollectController } from './post-collect.controller';

@Module({
  controllers: [PostCollectController],
  providers: [PostCollectService],
})
export class PostCollectModule {}
