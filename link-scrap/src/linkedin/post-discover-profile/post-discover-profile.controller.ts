import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PostDiscoverProfileService } from './post-discover-profile.service';
import { LinkedInProfileUrlDto } from '../../brightdata/dto/linkedin-profile-url.dto';

@ApiTags('LinkedIn Post Discovery by Profile URL')
@Controller('linkedin/post-discover-profile')
export class PostDiscoverProfileController {
  constructor(private readonly postDiscoverProfileService: PostDiscoverProfileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Discover LinkedIn posts by profile URL',
    description: 'Trigger LinkedIn post discovery using BrightData API with profile URLs and optional date ranges. This endpoint starts an async operation and returns a snapshot_id for monitoring progress.',
  })
  @ApiBody({
    type: LinkedInProfileUrlDto,
    examples: {
      example1: {
        summary: 'Single profile with date range',
        value: {
          profiles: [
            {
              url: 'https://www.linkedin.com/in/bettywliu',
              start_date: '2018-04-25T00:00:00.000Z',
              end_date: '2021-05-25T00:00:00.000Z'
            }
          ]
        }
      },
      example2: {
        summary: 'Multiple profiles with different date ranges',
        value: {
          profiles: [
            {
              url: 'https://www.linkedin.com/in/bettywliu',
              start_date: '2020-01-01T00:00:00.000Z',
              end_date: '2023-12-31T00:00:00.000Z'
            },
            {
              url: 'https://www.linkedin.com/in/johndoe',
              start_date: '2019-06-01T00:00:00.000Z',
              end_date: '2022-06-01T00:00:00.000Z'
            }
          ]
        }
      },
      example3: {
        summary: 'Profile without date range (all posts)',
        value: {
          profiles: [
            {
              url: 'https://www.linkedin.com/in/janedoe'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Post discovery started successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'LinkedIn post discovery by profile URL started successfully. Use the snapshot_id to check status and retrieve data when ready.' },
        snapshot_id: { type: 'string', example: 's_mde4jqx62neo65covf' },
        status: { type: 'string', example: 'started' },
        profile_urls: { type: 'number', example: 2 },
        instructions: {
          type: 'object',
          properties: {
            check_status: { type: 'string', example: 'GET /linkedin/post-discover-profile/snapshot/s_mde4jqx62neo65covf/status' },
            get_data: { type: 'string', example: 'GET /linkedin/post-discover-profile/snapshot/s_mde4jqx62neo65covf/data' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or URL format'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during post discovery'
  })
  async discoverPostsByProfileUrl(@Body() linkedInProfileUrlDto: LinkedInProfileUrlDto) {
    return this.postDiscoverProfileService.discoverPostsByProfileUrl(linkedInProfileUrlDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a LinkedIn post discovery by profile URL snapshot'
  })
  @ApiParam({ name: 'snapshotId', description: 'BrightData snapshot identifier' })
  @ApiResponse({
    status: 200,
    description: 'Snapshot status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        snapshot_id: { type: 'string', example: 's_mde4jqx62neo65covf' },
        status: { type: 'string', example: 'ready' },
        dataset_id: { type: 'string', example: 'gd_lyy3tktm25m4avu764' },
        message: { type: 'string', example: 'Snapshot status: ready' }
      }
    }
  })
  async getSnapshotStatus(@Param('snapshotId') snapshotId: string) {
    return this.postDiscoverProfileService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve and save discovered LinkedIn post data from a completed snapshot'
  })
  @ApiParam({ name: 'snapshotId', description: 'BrightData snapshot identifier' })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved and saved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        snapshot_id: { type: 'string', example: 's_mde4jqx62neo65covf' },
        status: { type: 'string', example: 'ready' },
        message: { type: 'string', example: 'Successfully discovered 15 LinkedIn posts from profile URLs' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '7343546267496587264' },
              url: { type: 'string', example: 'https://www.linkedin.com/posts/university-college-of-aviation-malaysia-unicam_unicam-university-college-activity-7343546267496587264-BWV9' },
              post_type: { type: 'string', example: 'post' },
              date_posted: { type: 'string', example: '2025-06-25T07:51:06.627Z' },
              title: { type: 'string', example: 'In UniCAM, we offer a wide range of programs...' },
              post_text: { type: 'string', example: 'In UniCAM, we offer a wide range of programs from Foundation, Diploma...' },
              hashtags: { type: 'array', items: { type: 'string' }, example: ['#UniCAM', '#university', '#college', '#education'] },
              embedded_links: { type: 'array', items: { type: 'string' }, example: ['http://aviation.edu.my/', 'https://www.linkedin.com/feed/hashtag/unicam'] },
              engagement: {
                type: 'object',
                properties: {
                  likes: { type: 'number', example: 0 },
                  comments: { type: 'number', example: 0 }
                }
              },
              author: {
                type: 'object',
                properties: {
                  user_id: { type: 'string', example: 'university-college-of-aviation-malaysia-unicam' },
                  account_type: { type: 'string', example: 'Organization' },
                  followers: { type: 'number', example: 57 }
                }
              },
              media: {
                type: 'object',
                properties: {
                  images: { type: 'array', items: { type: 'string' }, example: ['https://media.licdn.com/dms/image/v2/D5622AQGOsKaJ2-L69Q/feedshare-shrink_2048_1536/B56ZemEagFHQA8-/0/1750837865911?e=2147483647&v=beta&t=8QF0gLiPUQzk1xA1eIkvZGopkM6-MCieD8rcGFTEslQ'] },
                  videos: { type: 'object', nullable: true },
                  document_cover_image: { type: 'string', nullable: true }
                }
              },
              profile_info: {
                type: 'object',
                properties: {
                  profile_url: { type: 'string', example: 'https://www.linkedin.com/in/bettywliu' },
                  profile_name: { type: 'string', example: 'Betty Liu' }
                }
              },
              tagged_companies: { type: 'array', items: { type: 'object' } },
              tagged_people: { type: 'array', items: { type: 'object' } }
            }
          }
        },
        saved_count: { type: 'number', example: 15 }
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.postDiscoverProfileService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all discovered posts',
    description: 'Retrieve all discovered LinkedIn posts from the database'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved discovered posts'
  })
  async findAll() {
    return this.postDiscoverProfileService.findAll();
  }

  @Get('profile/:encodedUrl')
  @ApiOperation({
    summary: 'Get posts by profile URL',
    description: 'Retrieve LinkedIn posts filtered by profile URL (URL encoded)'
  })
  @ApiParam({ name: 'encodedUrl', description: 'URL encoded LinkedIn profile URL' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved posts for profile URL'
  })
  async findByProfileUrl(@Param('encodedUrl') encodedUrl: string) {
    const profileUrl = decodeURIComponent(encodedUrl);
    return this.postDiscoverProfileService.findByProfileUrl(profileUrl);
  }

  @Get('account-type/:accountType')
  @ApiOperation({
    summary: 'Get posts by account type',
    description: 'Retrieve LinkedIn posts filtered by account type (Organization, Individual, etc.)'
  })
  @ApiParam({ name: 'accountType', description: 'Account type filter' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved posts for account type'
  })
  async findByAccountType(@Param('accountType') accountType: string) {
    return this.postDiscoverProfileService.findByAccountType(accountType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a specific discovered LinkedIn post by its database ID'
  })
  @ApiParam({ name: 'id', description: 'Database record ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved post'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async findOne(@Param('id') id: string) {
    return this.postDiscoverProfileService.findOne(id);
  }

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Get post by LinkedIn post ID',
    description: 'Retrieve a specific discovered LinkedIn post by its LinkedIn post ID'
  })
  @ApiParam({ name: 'postId', description: 'LinkedIn post identifier' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved post'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async findByPostId(@Param('postId') postId: string) {
    return this.postDiscoverProfileService.findByPostId(postId);
  }
}
