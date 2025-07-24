import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInProfileUrlDto } from '../../brightdata/dto/linkedin-profile-url.dto';
import { LinkedInPostDiscoverProfile } from './entities/post-discover-profile.entity';

@Injectable()
export class PostDiscoverProfileService {
  private readonly logger = new Logger(PostDiscoverProfileService.name);

  constructor(
    @InjectRepository(LinkedInPostDiscoverProfile)
    private readonly postDiscoverProfileRepository: Repository<LinkedInPostDiscoverProfile>,
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
  ) {}

  async discoverPostsByProfileUrl(linkedInProfileUrlDto: LinkedInProfileUrlDto) {
    try {
      const datasetId = this.configService.get<string>('LINKEDIN_POST_DISCOVER_PROFILE_DATASET_ID');

      if (!datasetId) {
        throw new Error('LinkedIn Post Discover Profile dataset ID is not configured');
      }

      this.logger.log(`Discovering LinkedIn posts for ${linkedInProfileUrlDto.profiles.length} profile URLs`);

      // Transform profiles for BrightData API
      const payload = linkedInProfileUrlDto.profiles.map((profile: any) => ({
        url: profile.url,
        ...(profile.start_date && { start_date: profile.start_date }),
        ...(profile.end_date && { end_date: profile.end_date }),
      }));

      // Call BrightData API to trigger post discovery by profile URL
      const brightDataResponse = await this.brightdataService.triggerDiscoverByProfileUrl(
        datasetId,
        payload,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Post discovery started.`);

        return {
          success: true,
          message: 'LinkedIn post discovery by profile URL started successfully. Use the snapshot_id to check status and retrieve data when ready.',
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          profile_urls: linkedInProfileUrlDto.profiles.length,
          instructions: {
            check_status: `GET /linkedin/post-discover-profile/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/post-discover-profile/snapshot/${brightDataResponse.snapshot_id}/data`,
          },
        };
      } else {
        throw new Error('Invalid response from BrightData API - missing snapshot_id');
      }
    } catch (error) {
      this.logger.error(`Error discovering posts by profile URL: ${error.message}`);
      throw error;
    }
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      this.logger.log(`Checking status for snapshot: ${snapshotId}`);
      const status = await this.brightdataService.monitorProgress(snapshotId);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: status.status,
        ...(status.dataset_id && { dataset_id: status.dataset_id }),
        message: `Snapshot status: ${status.status}`,
      };
    } catch (error) {
      this.logger.error(`Error checking snapshot status: ${error.message}`);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string) {
    try {
      this.logger.log(`Retrieving data for snapshot: ${snapshotId}`);

      // First check if snapshot is ready
      const status = await this.brightdataService.monitorProgress(snapshotId);

      if (status.status !== 'ready') {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: status.status,
          message: `Snapshot is not ready yet. Current status: ${status.status}`,
        };
      }

      // Download the data
      const data = await this.brightdataService.downloadSnapshot(snapshotId);

      if (!data || !Array.isArray(data)) {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: 'ready',
          message: 'No data found in snapshot',
          data: [],
          saved_count: 0,
        };
      }

      this.logger.log(`Retrieved ${data.length} posts from BrightData`);

      // Save data to database
      const savedPosts = await this.savePostsToDatabase(data, snapshotId);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: 'ready',
        message: `Successfully discovered ${data.length} LinkedIn posts from profile URLs`,
        data: this.formatPostsForFrontend(savedPosts),
        saved_count: savedPosts.length,
      };
    } catch (error) {
      this.logger.error(`Error retrieving snapshot data: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      const posts = await this.postDiscoverProfileRepository.find({
        order: { date_posted: 'DESC' },
      });

      return this.formatPostsForFrontend(posts);
    } catch (error) {
      this.logger.error(`Error finding all posts: ${error.message}`);
      throw error;
    }
  }

  async findByProfileUrl(profileUrl: string) {
    try {
      const posts = await this.postDiscoverProfileRepository.find({
        where: { profile_url: profileUrl },
        order: { date_posted: 'DESC' },
      });

      return this.formatPostsForFrontend(posts);
    } catch (error) {
      this.logger.error(`Error finding posts by profile URL: ${error.message}`);
      throw error;
    }
  }

  async findByAccountType(accountType: string) {
    try {
      const posts = await this.postDiscoverProfileRepository.find({
        where: { account_type: accountType },
        order: { date_posted: 'DESC' },
      });

      return this.formatPostsForFrontend(posts);
    } catch (error) {
      this.logger.error(`Error finding posts by account type: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.postDiscoverProfileRepository.findOne({
        where: { id: id as any },
      });

      if (!post) {
        throw new Error(`Post with ID ${id} not found`);
      }

      return this.formatPostForFrontend(post);
    } catch (error) {
      this.logger.error(`Error finding post by ID: ${error.message}`);
      throw error;
    }
  }

  async findByPostId(postId: string) {
    try {
      const post = await this.postDiscoverProfileRepository.findOne({
        where: { post_id: postId },
      });

      if (!post) {
        throw new Error(`Post with LinkedIn post ID ${postId} not found`);
      }

      return this.formatPostForFrontend(post);
    } catch (error) {
      this.logger.error(`Error finding post by LinkedIn post ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save posts to database with duplicate prevention
   */
  private async savePostsToDatabase(posts: any[], snapshotId: string): Promise<LinkedInPostDiscoverProfile[]> {
    const savedPosts: LinkedInPostDiscoverProfile[] = [];

    for (const postData of posts) {
      try {
        // Check if post already exists
        const existingPost = await this.postDiscoverProfileRepository.findOne({
          where: { post_id: postData.id },
        });

        if (existingPost) {
          this.logger.log(`Post ${postData.id} already exists, skipping`);
          savedPosts.push(existingPost);
          continue;
        }

        // Map and save new post
        const mappedPost = this.mapPostData(postData, snapshotId);
        const savedPost = await this.postDiscoverProfileRepository.save(mappedPost);
        savedPosts.push(savedPost);

        this.logger.log(`Saved post: ${postData.id}`);
      } catch (error) {
        this.logger.error(`Error saving post ${postData.id}: ${error.message}`);
        // Continue with other posts even if one fails
      }
    }

    this.logger.log(`Successfully saved ${savedPosts.length} posts to database`);
    return savedPosts;
  }

  /**
   * Map BrightData post response to database entity format
   */
  private mapPostData(postData: any, snapshotId: string): Partial<LinkedInPostDiscoverProfile> {
    return {
      post_id: postData.id,
      url: postData.url,
      user_id: postData.user_id,
      use_url: postData.use_url,
      post_type: postData.post_type || 'post',
      date_posted: postData.date_posted ? new Date(postData.date_posted) : undefined,
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
      user_followers: postData.user_followers,
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
      profile_url: this.extractProfileUrlFromPost(postData),
      profile_name: this.extractProfileNameFromPost(postData),
      snapshot_id: snapshotId,
      discovery_input: postData,
    };
  }

  /**
   * Format posts for frontend consumption
   */
  private formatPostsForFrontend(posts: LinkedInPostDiscoverProfile[]): any[] {
    return posts.map(post => this.formatPostForFrontend(post));
  }

  /**
   * Format single post for frontend consumption
   */
  private formatPostForFrontend(post: LinkedInPostDiscoverProfile): any {
    return {
      id: post.post_id,
      url: post.url,
      post_type: post.post_type,
      date_posted: post.date_posted,
      title: post.title,
      post_text: post.post_text,
      hashtags: post.hashtags || [],
      embedded_links: post.embedded_links || [],
      engagement: {
        likes: post.num_likes,
        comments: post.num_comments,
      },
      author: {
        user_id: post.user_id,
        account_type: post.account_type,
        followers: post.user_followers,
      },
      media: {
        images: post.images || [],
        videos: post.videos,
        document_cover_image: post.document_cover_image,
      },
      profile_info: {
        profile_url: post.profile_url,
        profile_name: post.profile_name,
      },
      tagged_companies: post.tagged_companies || [],
      tagged_people: post.tagged_people || [],
    };
  }

  /**
   * Extract profile URL from post data
   */
  private extractProfileUrlFromPost(postData: any): string {
    // Try to extract from use_url or user_id
    if (postData.use_url && postData.use_url.includes('/in/')) {
      return postData.use_url;
    }

    if (postData.user_id) {
      return `https://www.linkedin.com/in/${postData.user_id}`;
    }

    return '';
  }

  /**
   * Extract profile name from post data
   */
  private extractProfileNameFromPost(postData: any): string {
    if (postData.user_id) {
      return postData.user_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    return '';
  }
}