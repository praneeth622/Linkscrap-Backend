import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInPostUrlDto } from '../../brightdata/dto';
import { LinkedInPost } from './entities/post-collect.entity';

@Injectable()
export class PostCollectService {
  private readonly logger = new Logger(PostCollectService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(LinkedInPost)
    private readonly linkedInPostRepository: Repository<LinkedInPost>,
  ) {}

  async collectLinkedInPosts(linkedInPostUrlDto: LinkedInPostUrlDto) {
    try {
      const datasetId = this.configService.get<string>('LINKEDIN_POST_COLLECT_DATASET_ID');

      if (!datasetId) {
        throw new Error('LinkedIn Post Collect dataset ID is not configured');
      }

      this.logger.log(`Collecting LinkedIn posts for ${linkedInPostUrlDto.urls.length} URLs`);

      // Transform URLs for BrightData API
      const payload = linkedInPostUrlDto.urls.map(url => ({ url }));

      // Call BrightData API to trigger post collection
      const brightDataResponse = await this.brightdataService.triggerDataset(
        datasetId,
        payload,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Post collection started.`);

        return {
          success: true,
          message: `LinkedIn post collection started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          post_urls: linkedInPostUrlDto.urls.length,
          instructions: {
            check_status: `GET /linkedin/post-collect/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/post-collect/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} posts`);

        // Save posts to database
        const savedPosts = await this.savePostsToDatabase(brightDataResponse, linkedInPostUrlDto.urls);

        return {
          success: true,
          message: `Successfully collected ${savedPosts.length} LinkedIn posts`,
          data: this.formatPostsForFrontend(brightDataResponse),
          saved_count: savedPosts.length,
          post_urls: linkedInPostUrlDto.urls.length,
        };
      }

      // Handle response with data property
      if (brightDataResponse?.data && Array.isArray(brightDataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightDataResponse.data.length} posts`);

        // Save posts to database
        const savedPosts = await this.savePostsToDatabase(brightDataResponse.data, linkedInPostUrlDto.urls);

        return {
          success: true,
          message: `Successfully collected ${savedPosts.length} LinkedIn posts`,
          data: this.formatPostsForFrontend(brightDataResponse.data),
          saved_count: savedPosts.length,
          post_urls: linkedInPostUrlDto.urls.length,
        };
      }

      // If we reach here, the response format is unexpected
      this.logger.warn(`Unexpected response format from BrightData: ${JSON.stringify(brightDataResponse, null, 2)}`);

      return {
        success: false,
        message: 'Unexpected response format from BrightData API',
        raw_response: brightDataResponse,
      };
    } catch (error) {
      this.logger.error(`Error collecting LinkedIn posts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract posts from BrightData response
   */
  private extractPostsFromResponse(response: any): any[] {
    this.logger.debug(`Extracting posts from response type: ${typeof response}`);

    if (Array.isArray(response)) {
      this.logger.log(`Found ${response.length} posts in array response`);
      return response;
    }

    if (response?.data && Array.isArray(response.data)) {
      this.logger.log(`Found ${response.data.length} posts in response.data`);
      return response.data;
    }

    if (response?.results && Array.isArray(response.results)) {
      this.logger.log(`Found ${response.results.length} posts in response.results`);
      return response.results;
    }

    this.logger.warn(`No posts found in response: ${JSON.stringify(response, null, 2)}`);
    return [];
  }

  /**
   * Save posts to database
   */
  private async savePostsToDatabase(postsData: any[], inputUrls: string[]): Promise<LinkedInPost[]> {
    const savedPosts: LinkedInPost[] = [];

    for (const postData of postsData) {
      try {
        // Check if post already exists
        const existingPost = await this.linkedInPostRepository.findOne({
          where: {
            post_id: postData.id || postData.post_id,
            url: postData.url
          },
        });

        if (existingPost) {
          this.logger.log(`Post already exists: ${postData.id || postData.post_id} - ${postData.title || 'No title'}`);
          continue;
        }

        // Map and save new post
        const mappedPostData = this.mapPostData(postData, inputUrls);
        const post = this.linkedInPostRepository.create(mappedPostData);
        const savedPost = await this.linkedInPostRepository.save(post);

        savedPosts.push(savedPost);
        this.logger.log(`Saved LinkedIn post: ${savedPost.post_id} - ${savedPost.title || 'No title'}`);
      } catch (error) {
        this.logger.error(`Error saving post ${postData.id || postData.post_id}: ${error.message}`);
        // Continue with other posts
      }
    }

    this.logger.log(`Successfully saved ${savedPosts.length} out of ${postsData.length} LinkedIn posts`);
    return savedPosts;
  }

  /**
   * Map BrightData post response to database entity format
   */
  private mapPostData(postData: any, inputUrls: string[]): Partial<LinkedInPost> {
    // Find matching input URL
    const matchingUrl = inputUrls.find(url =>
      postData.url?.includes(url.split('?')[0]) ||
      url.includes(postData.id || postData.post_id)
    ) || inputUrls[0] || '';

    return {
      post_id: postData.id || postData.post_id,
      url: postData.url,
      user_id: postData.user_id,
      user_url: postData.use_url || postData.user_url,
      post_type: postData.post_type,
      date_posted: postData.date_posted ? new Date(postData.date_posted) : null,
      title: postData.title,
      headline: postData.headline,
      post_text: postData.post_text,
      post_text_html: postData.post_text_html,
      hashtags: postData.hashtags || [],
      embedded_links: postData.embedded_links || [],
      images: postData.images,
      videos: postData.videos,
      video_duration: postData.video_duration,
      repost: postData.repost,
      num_likes: parseInt(postData.num_likes) || 0,
      num_comments: parseInt(postData.num_comments) || 0,
      top_visible_comments: postData.top_visible_comments,
      user_title: postData.user_title,
      author_profile_pic: postData.author_profile_pic,
      num_connections: parseInt(postData.num_connections) || null,
      user_followers: parseInt(postData.user_followers) || null,
      account_type: postData.account_type,
      more_articles_by_user: postData.more_articles_by_user,
      more_relevant_posts: postData.more_relevant_posts,
      user_posts: parseInt(postData.user_posts) || 0,
      user_articles: parseInt(postData.user_articles) || 0,
      tagged_companies: postData.tagged_companies || [],
      tagged_people: postData.tagged_people || [],
      external_link_data: postData.external_link_data,
      video_thumbnail: postData.video_thumbnail,
      document_cover_image: postData.document_cover_image,
      document_page_count: parseInt(postData.document_page_count) || null,
      input_url: matchingUrl,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format posts for frontend consumption
   */
  private formatPostsForFrontend(postsData: any[]): any[] {
    return postsData.map(post => ({
      id: post.id || post.post_id,
      url: post.url,
      post_type: post.post_type,
      date_posted: post.date_posted,
      title: post.title,
      headline: post.headline,
      post_text: post.post_text,
      hashtags: post.hashtags || [],
      embedded_links: post.embedded_links || [],
      engagement: {
        likes: parseInt(post.num_likes) || 0,
        comments: parseInt(post.num_comments) || 0,
      },
      author: {
        user_id: post.user_id,
        user_url: post.use_url || post.user_url,
        title: post.user_title,
        profile_pic: post.author_profile_pic,
        followers: parseInt(post.user_followers) || null,
        account_type: post.account_type,
      },
      media: {
        images: post.images,
        videos: post.videos,
        video_duration: post.video_duration,
        video_thumbnail: post.video_thumbnail,
        document_cover_image: post.document_cover_image,
        document_page_count: post.document_page_count,
      },
      tagged_companies: post.tagged_companies || [],
      tagged_people: post.tagged_people || [],
      repost: post.repost,
      external_link_data: post.external_link_data,
    }));
  }

  async getAllPosts() {
    return this.linkedInPostRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getPostById(id: string) {
    return this.linkedInPostRepository.findOne({ where: { id } });
  }

  async getPostByPostId(postId: string) {
    return this.linkedInPostRepository.findOne({
      where: { post_id: postId },
    });
  }

  async getPostsByAccountType(accountType: string) {
    return this.linkedInPostRepository.find({
      where: { account_type: accountType },
      order: { created_at: 'DESC' },
    });
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      const progress = await this.brightdataService.monitorProgress(snapshotId);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        dataset_id: progress.dataset_id,
        message: `Snapshot status: ${progress.status}`,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot status ${snapshotId}: ${error.message}`);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string, inputUrls: string[] = []) {
    try {
      // Check snapshot status first
      const progress = await this.brightdataService.monitorProgress(snapshotId);

      if (progress.status !== 'ready') {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: progress.status,
          message: `Snapshot is not ready yet. Current status: ${progress.status}`,
        };
      }

      // Download the snapshot data
      const snapshotData = await this.brightdataService.downloadSnapshot(snapshotId);

      // Extract posts from the downloaded data
      const postsData = this.extractPostsFromResponse(snapshotData);

      // Save posts to database
      const savedPosts = await this.savePostsToDatabase(postsData, inputUrls);

      this.logger.log(`Successfully processed ${savedPosts.length} LinkedIn posts from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully collected ${postsData.length} LinkedIn posts`,
        data: this.formatPostsForFrontend(postsData),
        saved_count: savedPosts.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
