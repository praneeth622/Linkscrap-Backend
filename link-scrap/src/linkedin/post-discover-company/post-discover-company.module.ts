import { Module } from '@nestjs/common';
import { PostDiscoverCompanyService } from './post-discover-company.service';
import { PostDiscoverCompanyController } from './post-discover-company.controller';

@Module({
  controllers: [PostDiscoverCompanyController],
  providers: [PostDiscoverCompanyService],
})
export class PostDiscoverCompanyModule {}
