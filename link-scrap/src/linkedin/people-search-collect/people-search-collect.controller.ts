import { Controller, Post, Body, Get, Param, Query, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../auth/decorators/user.decorator';
import { PeopleSearchCollectService } from './people-search-collect.service';
import {
  LinkedInPeopleSearchRequestDto,
  LinkedInPeopleSearchResponseDto,
  PaginatedLinkedInPeopleDto,
  LinkedInPersonDto,
  SearchCriteriaDto
} from './dto/linkedin-people-search-collect.dto';

@ApiTags('LinkedIn People Search - Collect by URL')
@ApiBearerAuth()
@Controller('linkedin/people-search-collect')
export class PeopleSearchCollectController {
  constructor(private readonly peopleSearchCollectService: PeopleSearchCollectService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Collect LinkedIn people by search criteria',
    description: 'Trigger LinkedIn people search collection using BrightData API with search criteria (URL, first name, last name). This endpoint starts an async operation and returns a snapshot_id for monitoring progress.',
  })
  @ApiBody({
    type: LinkedInPeopleSearchRequestDto,
    examples: {
      singleSearch: {
        summary: 'Single search example',
        value: {
          searches: [
            {
              url: 'https://www.linkedin.com',
              first_name: 'james',
              last_name: 'smith'
            }
          ]
        }
      },
      multipleSearches: {
        summary: 'Multiple searches example',
        value: {
          searches: [
            {
              url: 'https://www.linkedin.com',
              first_name: 'james',
              last_name: 'smith'
            },
            {
              url: 'https://www.linkedin.com',
              first_name: 'Lisa',
              last_name: 'Ledger'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'People search collection started successfully',
    type: LinkedInPeopleSearchResponseDto,
    examples: {
      asyncResponse: {
        summary: 'Async operation started',
        value: {
          success: true,
          message: 'LinkedIn people search collection started successfully. Use the snapshot_id to check status and retrieve data when ready.',
          snapshot_id: 's_mdea2wuk1dr7b21l7r',
          status: 'started',
          searches_count: 2,
          instructions: {
            check_status: 'GET /linkedin/people-search-collect/snapshot/s_mdea2wuk1dr7b21l7r/status',
            get_data: 'GET /linkedin/people-search-collect/snapshot/s_mdea2wuk1dr7b21l7r/data'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['searches must contain at least 1 elements'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'LinkedIn People Search Collect dataset ID is not configured',
        error: 'Internal Server Error'
      }
    }
  })
  async collectPeopleSearch(
    @Body() requestDto: LinkedInPeopleSearchRequestDto,
    @CurrentUserId() userId: string
  ): Promise<LinkedInPeopleSearchResponseDto> {
    return this.peopleSearchCollectService.collectPeopleSearch(requestDto, userId);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a LinkedIn people search collection operation using the snapshot ID.',
  })
  @ApiParam({
    name: 'snapshotId',
    description: 'The snapshot ID returned from the collection request',
    example: 's_mdea2wuk1dr7b21l7r'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot status retrieved successfully',
    schema: {
      example: {
        snapshot_id: 's_mdea2wuk1dr7b21l7r',
        status: 'running',
        progress: 50
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Snapshot not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Snapshot not found',
        error: 'Not Found'
      }
    }
  })
  async getSnapshotStatus(@Param('snapshotId') snapshotId: string) {
    return this.peopleSearchCollectService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve the collected LinkedIn people data from a completed snapshot.',
  })
  @ApiParam({
    name: 'snapshotId',
    description: 'The snapshot ID returned from the collection request',
    example: 's_mdea2wuk1dr7b21l7r'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved successfully',
    type: [LinkedInPersonDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Snapshot not found or no data available',
    schema: {
      example: {
        statusCode: 404,
        message: 'Snapshot data not found',
        error: 'Not Found'
      }
    }
  })
  async getSnapshotData(
    @Param('snapshotId') snapshotId: string,
    @CurrentUserId() userId: string
  ) {
    return this.peopleSearchCollectService.getSnapshotData(snapshotId, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all collected people',
    description: 'Retrieve all LinkedIn people that have been collected and stored in the database with pagination.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'People retrieved successfully',
    type: PaginatedLinkedInPeopleDto
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUserId() userId: string
  ): Promise<PaginatedLinkedInPeopleDto> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    return this.peopleSearchCollectService.findAll(pageNum, limitNum, userId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search people by criteria',
    description: 'Search collected LinkedIn people using various criteria like first name, last name, location, or experience.',
  })
  @ApiQuery({
    name: 'first_name',
    required: false,
    description: 'Filter by first name (partial match)',
    example: 'james'
  })
  @ApiQuery({
    name: 'last_name',
    required: false,
    description: 'Filter by last name (partial match)',
    example: 'smith'
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location (partial match)',
    example: 'United Kingdom'
  })
  @ApiQuery({
    name: 'experience',
    required: false,
    description: 'Filter by experience (partial match)',
    example: 'Corporate Sales'
  })
  @ApiResponse({
    status: 200,
    description: 'People retrieved successfully',
    type: [LinkedInPersonDto]
  })
  async findBySearchCriteria(
    @Query('first_name') firstName?: string,
    @Query('last_name') lastName?: string,
    @Query('location') location?: string,
    @Query('experience') experience?: string
  ): Promise<LinkedInPersonDto[]> {
    const criteria: SearchCriteriaDto = {
      first_name: firstName,
      last_name: lastName,
      location,
      experience
    };
    return this.peopleSearchCollectService.findBySearchCriteria(criteria) as any;
  }

  @Get('location/:location')
  @ApiOperation({
    summary: 'Get people by location',
    description: 'Retrieve all LinkedIn people from a specific location.',
  })
  @ApiParam({
    name: 'location',
    description: 'Location to filter by',
    example: 'United Kingdom'
  })
  @ApiResponse({
    status: 200,
    description: 'People retrieved successfully',
    type: [LinkedInPersonDto]
  })
  async findByLocation(@Param('location') location: string): Promise<LinkedInPersonDto[]> {
    return this.peopleSearchCollectService.findByLocation(location) as any;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get person by ID',
    description: 'Retrieve a specific LinkedIn person by their database ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Database ID of the person',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Person retrieved successfully',
    type: LinkedInPersonDto
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Person with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  async findOne(@Param('id') id: string): Promise<LinkedInPersonDto> {
    return this.peopleSearchCollectService.findOne(id) as any;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update person information',
    description: 'Update specific fields of a LinkedIn person record.',
  })
  @ApiParam({
    name: 'id',
    description: 'Database ID of the person',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Smith' },
        subtitle: { type: 'string', example: 'Senior Software Engineer' },
        location: { type: 'string', example: 'San Francisco, CA' },
        experience: { type: 'string', example: 'Google Inc.' },
        education: { type: 'string', example: 'Stanford University' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Person updated successfully',
    type: LinkedInPersonDto
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Person with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  async update(@Param('id') id: string, @Body() updateData: any): Promise<LinkedInPersonDto> {
    return this.peopleSearchCollectService.update(id, updateData) as any;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete person record',
    description: 'Delete a LinkedIn person record from the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Database ID of the person',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Person deleted successfully',
    schema: {
      example: {
        message: 'Person deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Person not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Person with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.peopleSearchCollectService.remove(id);
    return { message: 'Person deleted successfully' };
  }
}
