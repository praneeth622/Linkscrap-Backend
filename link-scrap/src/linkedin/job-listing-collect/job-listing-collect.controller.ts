import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JobListingCollectService } from './job-listing-collect.service';
import { LinkedInJobUrlDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Job Listing - Collect')
@Controller('linkedin/job-listing/collect')
export class JobListingCollectController {
  constructor(
    private readonly jobListingCollectService: JobListingCollectService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Collect LinkedIn job listings by URLs',
    description: 'Trigger data collection for LinkedIn job listings using BrightData API. Returns a snapshot_id for async processing.'
  })
  @ApiBody({
    type: LinkedInJobUrlDto,
    examples: {
      example1: {
        summary: 'Single job URL example',
        value: {
          urls: ['https://www.linkedin.com/jobs/view/remote-typist-%E2%80%93-data-entry-specialist-work-from-home-at-cwa-group-4181034038?trk=public_jobs_topcard-title']
        }
      },
      example2: {
        summary: 'Multiple job URLs example',
        value: {
          urls: [
            'https://www.linkedin.com/jobs/view/remote-typist-%E2%80%93-data-entry-specialist-work-from-home-at-cwa-group-4181034038?trk=public_jobs_topcard-title',
            'https://www.linkedin.com/jobs/view/arrt-r-at-shared-imaging-llc-4180989163?trk=public_jobs_topcard-title'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Data collection started successfully',
    schema: {
      example: {
        success: true,
        message: 'Data collection started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        instructions: {
          check_status: 'GET /linkedin/job-listing/collect/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/job-listing/collect/snapshot/s_mdboahmo240821rs2a/data'
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
  async collectJobListings(@Body() linkedInJobUrlDto: LinkedInJobUrlDto) {
    return this.jobListingCollectService.collectJobListings(linkedInJobUrlDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a data collection snapshot'
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
    return this.jobListingCollectService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve and save job listing data from a completed snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved and saved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        message: 'Successfully retrieved 2 job listings',
        data: [
          {
            url: 'https://www.linkedin.com/jobs/view/planner-start-people-at-jobster-4270099119?_l=en',
            job_posting_id: '4270099119',
            job_title: 'Planner - Start People',
            company_name: 'Jobster',
            job_location: 'Doetinchem, Gelderland, Netherlands',
            job_employment_type: 'Full-time',
            job_num_applicants: 25
          }
        ],
        saved_count: 2
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.jobListingCollectService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all job listings',
    description: 'Retrieve all collected job listings from the database'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listings retrieved successfully'
  })
  async getAllJobListings() {
    return this.jobListingCollectService.getAllJobListings();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job listing by ID',
    description: 'Retrieve a specific job listing by its database ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listing retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Job listing not found'
  })
  async getJobListingById(@Param('id') id: string) {
    return this.jobListingCollectService.getJobListingById(id);
  }

  @Get('posting/:postingId')
  @ApiOperation({
    summary: 'Get job listing by posting ID',
    description: 'Retrieve a specific job listing by its LinkedIn posting ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Job listing retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Job listing not found'
  })
  async getJobListingByPostingId(@Param('postingId') postingId: string) {
    return this.jobListingCollectService.getJobListingByPostingId(postingId);
  }
}
