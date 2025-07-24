import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PostDiscoverCompanyService } from './post-discover-company.service';
import { LinkedInCompanyUrlDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Posts - Discover by Company URL')
@Controller('linkedin/post-discover-company')
export class PostDiscoverCompanyController {
  constructor(
    private readonly postDiscoverCompanyService: PostDiscoverCompanyService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Discover LinkedIn posts by company URLs',
    description: 'Trigger post discovery using BrightData API with LinkedIn company URLs. Discovers posts published by specific companies. Returns a snapshot_id for async processing.'
  })
  @ApiBody({
    type: LinkedInCompanyUrlDto,
    examples: {
      example1: {
        summary: 'Single company example',
        value: {
          urls: ['https://www.linkedin.com/company/lanieri']
        }
      },
      example2: {
        summary: 'Multiple companies example',
        value: {
          urls: [
            'https://www.linkedin.com/company/lanieri',
            'https://www.linkedin.com/company/effortel',
            'https://www.linkedin.com/company/green-philly'
          ]
        }
      },
      example3: {
        summary: 'Companies with parameters example',
        value: {
          urls: [
            'https://www.linkedin.com/company/microsoft?trk=public_profile',
            'https://www.linkedin.com/company/google?originalSubdomain=in',
            'https://www.linkedin.com/company/apple'
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'LinkedIn post discovery by company URL started successfully',
    schema: {
      example: {
        success: true,
        message: 'LinkedIn post discovery by company URL started successfully. Use the snapshot_id to check status and retrieve data when ready.',
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'started',
        company_urls: 3,
        instructions: {
          check_status: 'GET /linkedin/post-discover-company/snapshot/s_mdboahmo240821rs2a/status',
          get_data: 'GET /linkedin/post-discover-company/snapshot/s_mdboahmo240821rs2a/data'
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
  async discoverPostsByCompanyUrl(@Body() linkedInCompanyUrlDto: LinkedInCompanyUrlDto) {
    return this.postDiscoverCompanyService.discoverPostsByCompanyUrl(linkedInCompanyUrlDto);
  }

  @Get('snapshot/:snapshotId/status')
  @ApiOperation({
    summary: 'Check snapshot status',
    description: 'Check the status of a LinkedIn post discovery by company URL snapshot'
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
    return this.postDiscoverCompanyService.getSnapshotStatus(snapshotId);
  }

  @Get('snapshot/:snapshotId/data')
  @ApiOperation({
    summary: 'Get snapshot data',
    description: 'Retrieve and save discovered LinkedIn post data from a completed snapshot'
  })
  @ApiResponse({
    status: 200,
    description: 'Snapshot data retrieved and saved successfully',
    schema: {
      example: {
        success: true,
        snapshot_id: 's_mdboahmo240821rs2a',
        status: 'ready',
        message: 'Successfully discovered 15 LinkedIn posts from company URLs',
        data: [
          {
            id: '7343546267496587264',
            url: 'https://www.linkedin.com/posts/university-college-of-aviation-malaysia-unicam_unicam-university-college-activity-7343546267496587264-BWV9',
            post_type: 'post',
            date_posted: '2025-06-25T07:51:06.627Z',
            title: 'In UniCAM, we offer a wide range of programs...',
            post_text: 'In UniCAM, we offer a wide range of programs from Foundation, Diploma...',
            hashtags: ['#UniCAM', '#university', '#college', '#education'],
            engagement: {
              likes: 0,
              comments: 0
            },
            author: {
              user_id: 'university-college-of-aviation-malaysia-unicam',
              account_type: 'Organization',
              followers: 57
            },
            company_info: {
              company_url: 'https://www.linkedin.com/company/university-college-of-aviation-malaysia-unicam',
              company_name: 'University College of Aviation Malaysia Unicam'
            }
          }
        ],
        saved_count: 15
      }
    }
  })
  async getSnapshotData(@Param('snapshotId') snapshotId: string) {
    return this.postDiscoverCompanyService.getSnapshotData(snapshotId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all discovered posts',
    description: 'Retrieve all discovered LinkedIn posts from the database'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully'
  })
  async getAllDiscoveredPosts() {
    return this.postDiscoverCompanyService.getAllDiscoveredPosts();
  }

  @Get('company/:companyName')
  @ApiOperation({
    summary: 'Get posts by company name',
    description: 'Retrieve LinkedIn posts filtered by company name'
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully'
  })
  async getDiscoveredPostsByCompany(@Param('companyName') companyName: string) {
    return this.postDiscoverCompanyService.getDiscoveredPostsByCompany(companyName);
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
  async getDiscoveredPostsByAccountType(@Param('accountType') accountType: string) {
    return this.postDiscoverCompanyService.getDiscoveredPostsByAccountType(accountType);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieve a specific discovered LinkedIn post by its database ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async getDiscoveredPostById(@Param('id') id: string) {
    return this.postDiscoverCompanyService.getDiscoveredPostById(id);
  }

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Get post by LinkedIn post ID',
    description: 'Retrieve a specific discovered LinkedIn post by its LinkedIn post ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found'
  })
  async getDiscoveredPostByPostId(@Param('postId') postId: string) {
    return this.postDiscoverCompanyService.getDiscoveredPostByPostId(postId);
  }
}
