import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrightdataModule } from '../../brightdata/brightdata.module';
import { PostDiscoverCompanyService } from './post-discover-company.service';
import { PostDiscoverCompanyController } from './post-discover-company.controller';
import { LinkedInPostDiscoverCompany } from './entities/post-discover-company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInPostDiscoverCompany]),
    BrightdataModule,
  ],
  controllers: [PostDiscoverCompanyController],
  providers: [PostDiscoverCompanyService],
  exports: [PostDiscoverCompanyService],
})
export class PostDiscoverCompanyModule {}
