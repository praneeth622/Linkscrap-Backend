import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { PeopleProfileCollectModule } from './linkedin/people-profile-collect/people-profile-collect.module';
import { PeopleProfileDiscoverModule } from './linkedin/people-profile-discover/people-profile-discover.module';
import { CompanyInfoCollectModule } from './linkedin/company-info-collect/company-info-collect.module';
import { JobListingCollectModule } from './linkedin/job-listing-collect/job-listing-collect.module';
import { JobListingDiscoverKeywordModule } from './linkedin/job-listing-discover-keyword/job-listing-discover-keyword.module';
import { JobListingDiscoverUrlModule } from './linkedin/job-listing-discover-url/job-listing-discover-url.module';
import { PostCollectModule } from './linkedin/post-collect/post-collect.module';
import { PostDiscoverCompanyModule } from './linkedin/post-discover-company/post-discover-company.module';
import { PostDiscoverProfileModule } from './linkedin/post-discover-profile/post-discover-profile.module';
import { PostDiscoverUrlModule } from './linkedin/post-discover-url/post-discover-url.module';
import { PeopleSearchCollectModule } from './linkedin/people-search-collect/people-search-collect.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/linkscrap_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
    }),
    // AuthModule, // Temporarily disabled - causing startup hang
    // Temporarily disabled all LinkedIn modules to isolate issue
    // PostDiscoverUrlModule,
    // PeopleProfileCollectModule,
    // PeopleProfileDiscoverModule,
    // CompanyInfoCollectModule,
    // JobListingCollectModule,
    // JobListingDiscoverKeywordModule,
    // JobListingDiscoverUrlModule,
    // PostCollectModule,
    // PostDiscoverCompanyModule,
    // PostDiscoverProfileModule,
    // PeopleSearchCollectModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Temporarily disabled - causing startup hang
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
