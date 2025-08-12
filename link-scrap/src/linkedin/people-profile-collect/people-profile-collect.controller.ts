import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/decorators/user.decorator';
import { PeopleProfileCollectService } from './people-profile-collect.service';
import { LinkedInUrlDto } from '../../brightdata/dto';
import { DataCollectionRateLimit, DataRetrievalRateLimit } from '../../common/decorators/rate-limit.decorator';

@ApiTags('LinkedIn People Profile - Collect')
@ApiBearerAuth()
@Controller('linkedin/people-profile/collect')
export class PeopleProfileCollectController {
  constructor(
    private readonly peopleProfileCollectService: PeopleProfileCollectService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @DataCollectionRateLimit()
  @ApiOperation({
    summary: 'Collect LinkedIn profiles by URLs',
    description: 'Trigger data collection for LinkedIn profiles using BrightData API. Returns a snapshot_id for async processing. Rate limited to 10 requests per hour per user.'
  })
  @ApiBody({
    type: LinkedInUrlDto,
    examples: {
      example1: {
        summary: 'Single URL example',
        value: {
          urls: ['https://www.linkedin.com/in/elad-moshe-05a90413/']
        }
      },
      example2: {
        summary: 'Multiple URLs example',
        value: {
          urls: [
            'https://www.linkedin.com/in/elad-moshe-05a90413/',
            'https://www.linkedin.com/in/jonathan-myrvik-3baa01109',
            'https://www.linkedin.com/in/aviv-tal-75b81/'
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
          check_status: 'GET /linkedin/people-profile/collect/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/people-profile/collect/snapshot/s_mdboahmo240821rs2a/data'
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
  async collectProfiles(
    @Body() linkedInUrlDto: LinkedInUrlDto,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileCollectService.collectProfiles(linkedInUrlDto, userId);
  }

  @Get()
  @DataRetrievalRateLimit()
  @ApiOperation({ 
    summary: 'Get all collected profiles',
    description: 'Retrieve all LinkedIn profiles stored in the database. Rate limited to 100 requests per hour per user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profiles retrieved successfully' 
  })
  async getAllProfiles(@CurrentUserId() userId: string) {
    return this.peopleProfileCollectService.getAllProfiles(userId);
  }

  @Get(':id')
  @DataRetrievalRateLimit()
  @ApiOperation({ 
    summary: 'Get profile by ID',
    description: 'Retrieve a specific LinkedIn profile by its database ID. Rate limited to 100 requests per hour per user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Profile not found' 
  })
  async getProfileById(
    @Param('id') id: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileCollectService.getProfileById(id, userId);
  }

  @Get('linkedin-id/:linkedinId')
  @DataRetrievalRateLimit()
  @ApiOperation({
    summary: 'Get profile by LinkedIn ID',
    description: 'Retrieve a specific LinkedIn profile by its LinkedIn ID. Rate limited to 100 requests per hour per user.'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found'
  })
  async getProfileByLinkedInId(
    @Param('linkedinId') linkedinId: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileCollectService.getProfileByLinkedInId(linkedinId, userId);
  }

  @Get('snapshot/:snapshotId/status')
  @DataRetrievalRateLimit()
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a BrightData snapshot collection. Possible statuses: running, completed, ready, failed, error. Rate limited to 100 requests per hour per user.'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot status retrieved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'completed',
        dataset_id: 'gd_l1viktl72bvl7bjuj0',
        message: 'Snapshot status: completed'
      }
    }
  })
  @ApiResponse({
    status: 502,
    description: 'BrightData API error'
  })
  async getSnapshotStatus(@Param('snapshotId') snapshotId: string) {
    return this.peopleProfileCollectService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @DataRetrievalRateLimit()
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve the actual profile data from a completed BrightData snapshot. Only works when status is "completed" or "ready". Rate limited to 100 requests per hour per user.'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'completed',
        message: 'Successfully retrieved 1 profiles',
        data: [
          {
            timestamp: '2025-07-20',
            linkedin_num_id: '905328471',
            url: 'https://www.linkedin.com/in/praneeth-devarasetty/',
            name: 'Praneeth Devarasetty',
            country_code: 'US',
            city: 'San Francisco, CA',
            about: 'Software Engineer passionate about building scalable systems...',
            followers: 1200,
            connections: 500,
            position: 'Senior Software Engineer at Google'
          }
        ],
        saved_count: 1
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot not ready yet',
    schema: {
      example: {
        success: false,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'running',
        message: 'Snapshot is not ready yet. Current status: running'
      }
    }
  })
  @ApiResponse({
    status: 502,
    description: 'BrightData API error'
  })
  async getSnapshotData(
    @Param('snapshotId') snapshotId: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileCollectService.getSnapshotData(snapshotId, userId);
  }
}
