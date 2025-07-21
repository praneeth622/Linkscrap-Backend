import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JobListingDiscoverKeywordService } from './job-listing-discover-keyword.service';
import { JobSearchDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Job Listing - Discover by Keyword')
@Controller('linkedin/job-listing/discover-keyword')
export class JobListingDiscoverKeywordController {
  constructor(
    private readonly jobListingDiscoverKeywordService: JobListingDiscoverKeywordService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Discover LinkedIn job listings by keyword',
    description: 'Trigger job discovery using BrightData API with search parameters like keyword, location, experience level, etc. Returns a snapshot_id for async processing.'
  })
  @ApiBody({
    type: JobSearchDto,
    examples: {
      example1: {
        summary: 'Single search query example',
        value: {
          searches: [
            {
              location: "paris",
              keyword: "product manager",
              country: "FR",
              time_range: "Past month",
              job_type: "Full-time",
              experience_level: "Internship",
              remote: "On-site",
              company: "",
              location_radius: ""
            }
          ]
        }
      },
      example2: {
        summary: 'Multiple search queries example',
        value: {
          searches: [
            {
              location: "paris",
              keyword: "product manager",
              country: "FR",
              time_range: "Past month",
              job_type: "Full-time",
              experience_level: "Internship",
              remote: "On-site"
            },
            {
              location: "New York",
              keyword: "python developer",
              experience_level: "Executive"
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Job discovery started successfully',
    schema: {
      example: {
        success: true,
        message: 'Job discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        search_queries: 2,
        instructions: {
          check_status: 'GET /linkedin/job-listing/discover-keyword/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/job-listing/discover-keyword/snapshot/s_mdboahmo240821rs2a/data'
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
  async discoverJobListings(@Body() jobSearchDto: JobSearchDto) {
    return this.jobListingDiscoverKeywordService.discoverJobListings(jobSearchDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a job discovery snapshot'
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
    return this.jobListingDiscoverKeywordService.getSnapshotStatus(snapshotId);
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
        message: 'Successfully discovered 25 job listings',
        data: [
          {
            url: 'https://www.linkedin.com/jobs/view/planner-start-people-at-jobster-4270099119?_l=en',
            job_posting_id: '4270099119',
            job_title: 'Planner - Start People',
            company_name: 'Jobster',
            job_location: 'Doetinchem, Gelderland, Netherlands',
            job_employment_type: 'Full-time',
            job_num_applicants: 25,
            search_keyword: 'product manager',
            search_location: 'paris'
          }
        ],
        saved_count: 25
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.jobListingDiscoverKeywordService.getSnapshotData(snapshotId);
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
    return this.jobListingDiscoverKeywordService.getAllDiscoveredJobListings();
  }

  @Get('search/keyword/:keyword')
  @ApiOperation({
    summary: 'Get discovered job listings by keyword',
    description: 'Retrieve discovered job listings filtered by search keyword'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listings retrieved successfully'
  })
  async getDiscoveredJobListingsByKeyword(@Param('keyword') keyword: string) {
    return this.jobListingDiscoverKeywordService.getDiscoveredJobListingsByKeyword(keyword);
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
    return this.jobListingDiscoverKeywordService.getDiscoveredJobListingById(id);
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
    return this.jobListingDiscoverKeywordService.getDiscoveredJobListingByPostingId(postingId);
  }
}
