import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JobListingDiscoverUrlService } from './job-listing-discover-url.service';
import { JobDiscoveryUrlDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Job Listing - Discover by URL')
@Controller('linkedin/job-listing/discover-url')
export class JobListingDiscoverUrlController {
  constructor(
    private readonly jobListingDiscoverUrlService: JobListingDiscoverUrlService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Discover LinkedIn job listings by URL',
    description: 'Trigger job discovery using BrightData API with LinkedIn job URLs including search pages, company job pages, and other job listing URLs. Returns a snapshot_id for async processing.'
  })
  @ApiBody({
    type: JobDiscoveryUrlDto,
    examples: {
      example1: {
        summary: 'Job search URL example',
        value: {
          urls: ['https://www.linkedin.com/jobs/search?keywords=Software&location=Tel%20Aviv-Yafo&geoId=101570771&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0&f_TPR=r3600']
        }
      },
      example2: {
        summary: 'Company job pages example',
        value: {
          urls: [
            'https://www.linkedin.com/jobs/semrush-jobs?f_C=2821922',
            'https://www.linkedin.com/jobs/reddit-inc.-jobs-worldwide?f_C=150573'
          ]
        }
      },
      example3: {
        summary: 'Mixed URL types example',
        value: {
          urls: [
            'https://www.linkedin.com/jobs/search?keywords=Software&location=Tel%20Aviv-Yafo&geoId=101570771&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0&f_TPR=r3600',
            'https://www.linkedin.com/jobs/semrush-jobs?f_C=2821922',
            'https://www.linkedin.com/jobs/reddit-inc.-jobs-worldwide?f_C=150573'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Job discovery by URL started successfully',
    schema: {
      example: {
        success: true,
        message: 'Job discovery by URL started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        discovery_urls: 3,
        instructions: {
          check_status: 'GET /linkedin/job-listing/discover-url/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/job-listing/discover-url/snapshot/s_mdboahmo240821rs2a/data'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 502,
    description: 'BrightData API error'
  })
  async discoverJobListingsByUrl(@Body() jobDiscoveryUrlDto: JobDiscoveryUrlDto) {
    return this.jobListingDiscoverUrlService.discoverJobListingsByUrl(jobDiscoveryUrlDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a job discovery by URL snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot status retrieved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        dataset_id: 'gd_lpfll7v5hcqtkxl6l',
        message: 'Snapshot status: ready'
      }
    }
  })
  async getSnapshotStatus(@Param('snapshotId') snapshotId: string) {
    return this.jobListingDiscoverUrlService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve and save discovered job listing data from a completed snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved and saved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        message: 'Successfully discovered 50 job listings from URLs',
        data: [
          {
            url: 'https://www.linkedin.com/jobs/view/planner-start-people-at-jobster-4270099119?_l=en',
            job_posting_id: '4270099119',
            job_title: 'Planner - Start People',
            company_name: 'Jobster',
            job_location: 'Doetinchem, Gelderland, Netherlands',
            job_employment_type: 'Full-time',
            job_num_applicants: 25,
            discovery_url: 'https://www.linkedin.com/jobs/search?keywords=Software&location=Tel%20Aviv-Yafo',
            discovery_url_type: 'search'
          }
        ],
        saved_count: 50
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.jobListingDiscoverUrlService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all discovered job listings',
    description: 'Retrieve all discovered job listings from the database'
  })
  @ApiResponse({
    status: 200,
    description: 'Discovered job listings retrieved successfully'
  })
  async getAllDiscoveredJobListings() {
    return this.jobListingDiscoverUrlService.getAllDiscoveredJobListings();
  }

  @Get('url-type/:urlType')
  @ApiOperation({
    summary: 'Get discovered job listings by URL type',
    description: 'Retrieve discovered job listings filtered by URL type (search, company, general)'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listings retrieved successfully'
  })
  async getDiscoveredJobListingsByUrlType(@Param('urlType') urlType: string) {
    return this.jobListingDiscoverUrlService.getDiscoveredJobListingsByUrlType(urlType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get discovered job listing by ID',
    description: 'Retrieve a specific discovered job listing by its database ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listing retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Job listing not found'
  })
  async getDiscoveredJobListingById(@Param('id') id: string) {
    return this.jobListingDiscoverUrlService.getDiscoveredJobListingById(id);
  }

  @Get('posting/:postingId')
  @ApiOperation({
    summary: 'Get discovered job listing by posting ID',
    description: 'Retrieve a specific discovered job listing by its LinkedIn posting ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listing retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Job listing not found'
  })
  async getDiscoveredJobListingByPostingId(@Param('postingId') postingId: string) {
    return this.jobListingDiscoverUrlService.getDiscoveredJobListingByPostingId(postingId);
  }
}
