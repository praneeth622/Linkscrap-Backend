import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInPostDiscoverUrl } from './entities/linkedin-post-discover-url.entity';
import {
  LinkedInPostDiscoverUrlRequestDto,
  LinkedInPostDiscoverUrlResponseDto,
  PaginatedLinkedInPostsDto
} from './dto/linkedin-post-discover-url.dto';

@Injectable()
export class PostDiscoverUrlService {
  private readonly logger = new Logger(PostDiscoverUrlService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(LinkedInPostDiscoverUrl)
    private readonly postRepository: Repository<LinkedInPostDiscoverUrl>,
  ) {}

  async discoverPosts(requestDto: LinkedInPostDiscoverUrlRequestDto): Promise<LinkedInPostDiscoverUrlResponseDto> {
    try {
      const datasetId = this.configService.get<string>('LINKEDIN_POST_DISCOVER_URL_DATASET_ID');

      if (!datasetId) {
        throw new Error('LinkedIn Post Discover URL dataset ID is not configured');
      }

      // Transform URLs for BrightData API according to the provided code structure
      const payload = requestDto.urls.map(urlObj => ({
        url: urlObj.url,
        ...(urlObj.limit && { limit: urlObj.limit })
      }));

      this.logger.log(`Discovering posts for ${payload.length} URLs`);

      // Call BrightData API to trigger data discovery
      const brightDataResponse = await this.brightdataService.triggerDataset(
        datasetId,
        payload,
        'discover_new',
        'url'
      );

      this.logger.log(`BrightData response: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Post discovery started.`);

        return {
          success: true,
          message: `LinkedIn post discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          urls_count: payload.length,
          instructions: {
            check_status: `GET /linkedin/post-discover-url/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/post-discover-url/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // If we got direct data (sync operation), process and save it
      if (Array.isArray(brightDataResponse)) {
        const savedPosts = await this.processBrightDataResponse(brightDataResponse, requestDto.urls[0]?.url || '');

        return {
          success: true,
          message: `Successfully discovered and saved ${savedPosts.length} posts`,
          urls_count: payload.length
        };
      }

      throw new Error('Unexpected response format from BrightData API');

    } catch (error) {
      this.logger.error(`Error discovering posts: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      const status = await this.brightdataService.getSnapshotStatus(snapshotId);
      this.logger.log(`Snapshot ${snapshotId} status: ${JSON.stringify(status, null, 2)}`);
      return status;
    } catch (error) {
      this.logger.error(`Error getting snapshot status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string) {
    try {
      const data = await this.brightdataService.getSnapshotData(snapshotId);

      if (Array.isArray(data) && data.length > 0) {
        // Process and save the data
        const savedPosts = await this.processBrightDataResponse(data, '');
        this.logger.log(`Processed and saved ${savedPosts.length} posts from snapshot ${snapshotId}`);
        return savedPosts;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error getting snapshot data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processBrightDataResponse(data: any[], inputUrl: string): Promise<LinkedInPostDiscoverUrl[]> {
    const savedPosts: LinkedInPostDiscoverUrl[] = [];

    for (const postData of data) {
      try {
        // Check if post already exists
        const existingPost = await this.postRepository.findOne({
          where: { linkedin_post_id: postData.id }
        });

        if (existingPost) {
          this.logger.log(`Post ${postData.id} already exists, skipping`);
          continue;
        }

        // Create new post entity
        const post = this.postRepository.create({
          linkedin_post_id: postData.id,
          url: postData.url,
          user_id: postData.user_id,
          use_url: postData.use_url,
          post_type: postData.post_type,
          date_posted: postData.date_posted ? new Date(postData.date_posted) : null,
          title: postData.title,
          headline: postData.headline,
          post_text: postData.post_text,
          post_text_html: postData.post_text_html,
          hashtags: postData.hashtags || [],
          embedded_links: postData.embedded_links || [],
          images: postData.images || [],
          videos: postData.videos,
          video_duration: postData.video_duration,
          repost: postData.repost,
          num_likes: postData.num_likes || 0,
          num_comments: postData.num_comments || 0,
          top_visible_comments: postData.top_visible_comments,
          user_title: postData.user_title,
          author_profile_pic: postData.author_profile_pic,
          num_connections: postData.num_connections,
          user_followers: postData.user_followers || 0,
          account_type: postData.account_type,
          more_articles_by_user: postData.more_articles_by_user,
          more_relevant_posts: postData.more_relevant_posts,
          user_posts: postData.user_posts || 0,
          user_articles: postData.user_articles || 0,
          tagged_companies: postData.tagged_companies || [],
          tagged_people: postData.tagged_people || [],
          external_link_data: postData.external_link_data,
          video_thumbnail: postData.video_thumbnail,
          document_cover_image: postData.document_cover_image,
          document_page_count: postData.document_page_count,
          input_url: inputUrl,
          timestamp: new Date().toISOString()
        });

        const savedPost = await this.postRepository.save(post);
        savedPosts.push(savedPost);
        this.logger.log(`Saved post: ${savedPost.linkedin_post_id}`);

      } catch (error) {
        this.logger.error(`Error processing post ${postData.id}: ${error.message}`, error.stack);
      }
    }

    return savedPosts;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedLinkedInPostsDto> {
    const [posts, total] = await this.postRepository.findAndCount({
      order: { date_posted: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform posts to match DTO format
    const transformedPosts = posts.map(post => ({
      ...post,
      date_posted: post.date_posted ? post.date_posted.toISOString() : undefined
    }));

    return {
      data: transformedPosts as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByUrl(url: string): Promise<LinkedInPostDiscoverUrl[]> {
    return this.postRepository.find({
      where: { input_url: url },
      order: { date_posted: 'DESC', created_at: 'DESC' }
    });
  }

  async findByAccountType(accountType: string): Promise<LinkedInPostDiscoverUrl[]> {
    return this.postRepository.find({
      where: { account_type: accountType },
      order: { date_posted: 'DESC', created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<LinkedInPostDiscoverUrl> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findByLinkedInPostId(linkedinPostId: string): Promise<LinkedInPostDiscoverUrl> {
    const post = await this.postRepository.findOne({
      where: { linkedin_post_id: linkedinPostId }
    });
    if (!post) {
      throw new NotFoundException(`Post with LinkedIn ID ${linkedinPostId} not found`);
    }
    return post;
  }
}
