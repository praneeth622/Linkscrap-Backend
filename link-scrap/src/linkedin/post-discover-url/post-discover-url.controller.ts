import { Controller, Post, Body, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostDiscoverUrlService } from './post-discover-url.service';
import {
  LinkedInPostDiscoverUrlRequestDto,
  LinkedInPostDiscoverUrlResponseDto,
  PaginatedLinkedInPostsDto,
  LinkedInPostDto
} from './dto/linkedin-post-discover-url.dto';

@ApiTags('LinkedIn Posts - Discover by URL')
@Controller('linkedin/post-discover-url')
export class PostDiscoverUrlController {
  constructor(private readonly postDiscoverUrlService: PostDiscoverUrlService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Discover LinkedIn posts by URL',
    description: 'Trigger LinkedIn post discovery using BrightData API with URLs and optional limits. This endpoint starts an async operation and returns a snapshot_id for monitoring progress.',
  })
  @ApiBody({
    type: LinkedInPostDiscoverUrlRequestDto,
    examples: {
      singleUrl: {
        summary: 'Single URL example',
        value: {
          urls: [
            {
              url: 'https://www.linkedin.com/today/author/cristianbrunori?trk=public_post_follow-articles',
              limit: 50
            }
          ]
        }
      },
      multipleUrls: {
        summary: 'Multiple URLs example',
        value: {
          urls: [
            {
              url: 'https://www.linkedin.com/today/author/cristianbrunori?trk=public_post_follow-articles',
              limit: 50
            },
            {
              url: 'https://www.linkedin.com/today/author/stevenouri?trk=public_post_follow-articles'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Post discovery started successfully',
    type: LinkedInPostDiscoverUrlResponseDto,
    examples: {
      asyncResponse: {
        summary: 'Async operation started',
        value: {
          success: true,
          message: 'LinkedIn post discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.',
          snapshot_id: 's_mdea2wuk1dr7b21l7r',
          status: 'started',
          urls_count: 2,
          instructions: {
            check_status: 'GET /linkedin/post-discover-url/snapshot/s_mdea2wuk1dr7b21l7r/status',
            get_data: 'GET /linkedin/post-discover-url/snapshot/s_mdea2wuk1dr7b21l7r/data'
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
        message: ['urls must contain at least 1 elements'],
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
        message: 'LinkedIn Post Discover URL dataset ID is not configured',
        error: 'Internal Server Error'
      }
    }
  })
  async discoverPosts(@Body() requestDto: LinkedInPostDiscoverUrlRequestDto): Promise<LinkedInPostDiscoverUrlResponseDto> {
    return this.postDiscoverUrlService.discoverPosts(requestDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a LinkedIn post discovery operation using the snapshot ID.',
  })
  @ApiParam({
    name: 'snapshotId',
    description: 'The snapshot ID returned from the discovery request',
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
    return this.postDiscoverUrlService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve the discovered LinkedIn posts data from a completed snapshot.',
  })
  @ApiParam({
    name: 'snapshotId',
    description: 'The snapshot ID returned from the discovery request',
    example: 's_mdea2wuk1dr7b21l7r'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved successfully',
    type: [LinkedInPostDto]
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
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.postDiscoverUrlService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all discovered posts',
    description: 'Retrieve all LinkedIn posts that have been discovered and stored in the database with pagination.',
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
    description: 'Posts retrieved successfully',
    type: PaginatedLinkedInPostsDto
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ): Promise<PaginatedLinkedInPostsDto> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    return this.postDiscoverUrlService.findAll(pageNum, limitNum);
  }

  @Get('url/:encodedUrl')
  @ApiOperation({
    summary: 'Get posts by input URL',
    description: 'Retrieve all LinkedIn posts discovered from a specific input URL.',
  })
  @ApiParam({
    name: 'encodedUrl',
    description: 'URL-encoded input URL that was used for discovery',
    example: 'https%3A%2F%2Fwww.linkedin.com%2Ftoday%2Fauthor%2Fcristianbrunori'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: [LinkedInPostDto]
  })
  async findByUrl(@Param('encodedUrl') encodedUrl: string): Promise<LinkedInPostDto[]> {
    const decodedUrl = decodeURIComponent(encodedUrl);
    const posts = await this.postDiscoverUrlService.findByUrl(decodedUrl);
    return posts.map(post => ({
      ...post,
      date_posted: post.date_posted ? post.date_posted.toISOString() : undefined
    })) as any;
  }

  @Get('account-type/:accountType')
  @ApiOperation({
    summary: 'Get posts by account type',
    description: 'Retrieve all LinkedIn posts from a specific account type (Person, Organization, etc.).',
  })
  @ApiParam({
    name: 'accountType',
    description: 'Account type to filter by',
    example: 'Person'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: [LinkedInPostDto]
  })
  async findByAccountType(@Param('accountType') accountType: string): Promise<LinkedInPostDto[]> {
    const posts = await this.postDiscoverUrlService.findByAccountType(accountType);
    return posts.map(post => ({
      ...post,
      date_posted: post.date_posted ? post.date_posted.toISOString() : undefined
    })) as any;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a specific LinkedIn post by its database ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Database ID of the post',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
    type: LinkedInPostDto
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Post with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  async findOne(@Param('id') id: string): Promise<LinkedInPostDto> {
    const post = await this.postDiscoverUrlService.findOne(id);
    return {
      ...post,
      date_posted: post.date_posted ? post.date_posted.toISOString() : undefined
    } as any;
  }

  @Get('post/:linkedinPostId')
  @ApiOperation({
    summary: 'Get post by LinkedIn post ID',
    description: 'Retrieve a specific LinkedIn post by its LinkedIn post ID.',
  })
  @ApiParam({
    name: 'linkedinPostId',
    description: 'LinkedIn post ID',
    example: '7343546267496587264'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
    type: LinkedInPostDto
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Post with LinkedIn ID 7343546267496587264 not found',
        error: 'Not Found'
      }
    }
  })
  async findByLinkedInPostId(@Param('linkedinPostId') linkedinPostId: string): Promise<LinkedInPostDto> {
    const post = await this.postDiscoverUrlService.findByLinkedInPostId(linkedinPostId);
    return {
      ...post,
      date_posted: post.date_posted ? post.date_posted.toISOString() : undefined
    } as any;
  }
}
