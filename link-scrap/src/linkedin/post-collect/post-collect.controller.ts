import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PostCollectService } from './post-collect.service';
import { LinkedInPostUrlDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Posts - Collect')
@Controller('linkedin/post-collect')
export class PostCollectController {
  constructor(
    private readonly postCollectService: PostCollectService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Collect LinkedIn posts by URLs',
    description: 'Trigger data collection for LinkedIn posts using BrightData API. Supports posts, articles, and pulse content. Returns a snapshot_id for async processing.'
  })
  @ApiBody({
    type: LinkedInPostUrlDto,
    examples: {
      example1: {
        summary: 'LinkedIn posts example',
        value: {
          urls: [
            'https://www.linkedin.com/posts/orlenchner_scrapecon-activity-7180537307521769472-oSYN?trk=public_profile',
            'https://www.linkedin.com/posts/karin-dodis_web-data-collection-for-businesses-bright-activity-7176601589682434049-Aakz?trk=public_profile'
          ]
        }
      },
      example2: {
        summary: 'LinkedIn pulse articles example',
        value: {
          urls: [
            'https://www.linkedin.com/pulse/ab-test-optimisation-earlier-decisions-new-readout-de-b%C3%A9naz%C3%A9?trk=public_profile_article_view',
            'https://www.linkedin.com/pulse/getting-value-out-sunburst-guillaume-de-b%C3%A9naz%C3%A9?trk=public_profile_article_view'
          ]
        }
      },
      example3: {
        summary: 'Mixed content example',
        value: {
          urls: [
            'https://www.linkedin.com/pulse/ab-test-optimisation-earlier-decisions-new-readout-de-b%C3%A9naz%C3%A9?trk=public_profile_article_view',
            'https://www.linkedin.com/posts/orlenchner_scrapecon-activity-7180537307521769472-oSYN?trk=public_profile',
            'https://www.linkedin.com/posts/karin-dodis_web-data-collection-for-businesses-bright-activity-7176601589682434049-Aakz?trk=public_profile',
            'https://www.linkedin.com/pulse/getting-value-out-sunburst-guillaume-de-b%C3%A9naz%C3%A9?trk=public_profile_article_view'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'LinkedIn post collection started successfully',
    schema: {
      example: {
        success: true,
        message: 'LinkedIn post collection started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        post_urls: 4,
        instructions: {
          check_status: 'GET /linkedin/post-collect/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/post-collect/snapshot/s_mdboahmo240821rs2a/data'
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
  async collectLinkedInPosts(@Body() linkedInPostUrlDto: LinkedInPostUrlDto) {
    return this.postCollectService.collectLinkedInPosts(linkedInPostUrlDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a LinkedIn post collection snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot status retrieved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        dataset_id: 'gd_lyy3tktm25m4avu764',
        message: 'Snapshot status: ready'
      }
    }
  })
  async getSnapshotStatus(@Param('snapshotId') snapshotId: string) {
    return this.postCollectService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve and save LinkedIn post data from a completed snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved and saved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        message: 'Successfully collected 4 LinkedIn posts',
        data: [
          {
            id: '7351896543320330240',
            url: 'https://www.linkedin.com/posts/lifecell-international-pvt-ltd_lifecell-gold-elite-activity-7351896543320330240-rQ_s',
            post_type: 'post',
            date_posted: '2025-07-18T08:52:07.526Z',
            title: 'We\'re in the news! LifeCell Gold Elite...',
            post_text: 'We\'re in the news! LifeCell Gold Elite is making waves...',
            hashtags: ['#GoldElite', '#LifeCell', '#MediaCoverage'],
            engagement: {
              likes: 29,
              comments: 0
            },
            author: {
              user_id: 'lifecell-international-pvt-ltd',
              account_type: 'Organization',
              followers: 128845
            }
          }
        ],
        saved_count: 4
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.postCollectService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all collected posts',
    description: 'Retrieve all collected LinkedIn posts from the database'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully'
  })
  async getAllPosts() {
    return this.postCollectService.getAllPosts();
  }

  @Get('account-type/:accountType')
  @ApiOperation({
    summary: 'Get posts by account type',
    description: 'Retrieve LinkedIn posts filtered by account type (Organization, Individual, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully'
  })
  async getPostsByAccountType(@Param('accountType') accountType: string) {
    return this.postCollectService.getPostsByAccountType(accountType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a specific LinkedIn post by its database ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async getPostById(@Param('id') id: string) {
    return this.postCollectService.getPostById(id);
  }

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Get post by LinkedIn post ID',
    description: 'Retrieve a specific LinkedIn post by its LinkedIn post ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async getPostByPostId(@Param('postId') postId: string) {
    return this.postCollectService.getPostByPostId(postId);
  }
}
