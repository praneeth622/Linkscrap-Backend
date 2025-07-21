import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { PostCollectService } from './post-collect.service';
import { PostCollectController } from './post-collect.controller';
import { LinkedInPost } from './entities/post-collect.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInPost]),
    BrightdataModule,
  ],
  controllers: [PostCollectController],
  providers: [PostCollectService],
  exports: [PostCollectService],
})
export class PostCollectModule {}
