import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/decorators/user.decorator';
import { PeopleProfileDiscoverService } from './people-profile-discover.service';
import { CreatePeopleProfileDiscoverDto } from './dto/create-people-profile-discover.dto';
import { UpdatePeopleProfileDiscoverDto } from './dto/update-people-profile-discover.dto';

@ApiTags('LinkedIn People Profile - Discover by Name')
@ApiBearerAuth()
@Controller('linkedin/people-profile/discover')
export class PeopleProfileDiscoverController {
  constructor(private readonly peopleProfileDiscoverService: PeopleProfileDiscoverService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Discover LinkedIn profiles by name',
    description: 'Discover LinkedIn profiles by providing first and last names. Uses BrightData API with discover_by=name parameter.'
  })
  @ApiBody({ 
    type: CreatePeopleProfileDiscoverDto,
    examples: {
      example1: {
        summary: 'Single name search',
        value: {
          names: [
            { first_name: 'James', last_name: 'Smith' }
          ]
        }
      },
      example2: {
        summary: 'Multiple names search',
        value: {
          names: [
            { first_name: 'James', last_name: 'Smith' },
            { first_name: 'Sarah', last_name: 'Johnson' },
            { first_name: 'Michael', last_name: 'Brown' }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile discovery started successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        search_criteria: [
          { first_name: 'James', last_name: 'Smith' }
        ],
        instructions: {
          check_status: 'GET /linkedin/people-profile/discover/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/people-profile/discover/snapshot/s_mdboahmo240821rs2a/data'
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
  async discoverProfiles(
    @Body() createPeopleProfileDiscoverDto: CreatePeopleProfileDiscoverDto,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.discoverProfiles(createPeopleProfileDiscoverDto, userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all discovered profiles',
    description: 'Retrieve all LinkedIn profiles discovered by name searches stored in the database'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Discovered profiles retrieved successfully' 
  })
  async getAllDiscoveredProfiles(@CurrentUserId() userId: string) {
    return this.peopleProfileDiscoverService.getAllDiscoveredProfiles(userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get discovered profile by ID',
    description: 'Retrieve a specific discovered LinkedIn profile by its database ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Discovered profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Profile not found' 
  })
  async getDiscoveredProfileById(
    @Param('id') id: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.getDiscoveredProfileById(id, userId);
  }

  @Get('linkedin-id/:linkedinId')
  @ApiOperation({
    summary: 'Get discovered profile by LinkedIn ID',
    description: 'Retrieve a specific discovered LinkedIn profile by its LinkedIn ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Discovered profile retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found'
  })
  async getDiscoveredProfileByLinkedInId(
    @Param('linkedinId') linkedinId: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.getDiscoveredProfileByLinkedInId(linkedinId, userId);
  }

  @Get('search/:firstName/:lastName')
  @ApiOperation({
    summary: 'Search discovered profiles by name',
    description: 'Search for discovered profiles by first name and last name'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully'
  })
  async searchByName(
    @Param('firstName') firstName: string,
    @Param('lastName') lastName: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.searchByName(firstName, lastName, userId);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check discovery snapshot status',
    description: 'Check the status of a BrightData discover snapshot. Possible statuses: running, completed, ready, failed, error'
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
    return this.peopleProfileDiscoverService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get discovery snapshot data',
    description: 'Retrieve the discovered profile data from a completed BrightData snapshot. Only works when status is "completed" or "ready".'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'completed',
        message: 'Successfully retrieved 3 discovered profiles',
        data: [
          {
            timestamp: '2025-07-20',
            linkedin_num_id: '905328472',
            url: 'https://www.linkedin.com/in/james-smith/',
            name: 'James Smith',
            country_code: 'US',
            city: 'New York, NY',
            about: 'Software Engineer with 5+ years experience...',
            followers: 800,
            connections: 500,
            position: 'Software Engineer at Google'
          }
        ],
        saved_count: 3
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
    return this.peopleProfileDiscoverService.getSnapshotData(snapshotId, userId);
  }

  // Keep legacy endpoints for compatibility
  @Post('create')
  create(
    @Body() createPeopleProfileDiscoverDto: CreatePeopleProfileDiscoverDto,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.create(createPeopleProfileDiscoverDto, userId);
  }

  @Get('all')
  findAll(@CurrentUserId() userId: string) {
    return this.peopleProfileDiscoverService.findAll(userId);
  }

  @Get('findone/:id')
  findOne(
    @Param('id') id: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePeopleProfileDiscoverDto: UpdatePeopleProfileDiscoverDto,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.update(+id, updatePeopleProfileDiscoverDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleProfileDiscoverService.remove(+id, userId);
  }
}
