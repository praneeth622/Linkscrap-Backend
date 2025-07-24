import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInCompanyUrlDto } from '../../brightdata/dto';
import { LinkedInPostDiscoverCompany } from './entities/post-discover-company.entity';

@Injectable()
export class PostDiscoverCompanyService {
  private readonly logger = new Logger(PostDiscoverCompanyService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(LinkedInPostDiscoverCompany)
    private readonly linkedInPostDiscoverCompanyRepository: Repository<LinkedInPostDiscoverCompany>,
  ) {}

  async discoverPostsByCompanyUrl(linkedInCompanyUrlDto: LinkedInCompanyUrlDto) {
    try {
      const datasetId = this.configService.get<string>('LINKEDIN_POST_DISCOVER_COMPANY_DATASET_ID');

      if (!datasetId) {
        throw new Error('LinkedIn Post Discover Company dataset ID is not configured');
      }

      this.logger.log(`Discovering LinkedIn posts for ${linkedInCompanyUrlDto.urls.length} company URLs`);

      // Transform URLs for BrightData API
      const payload = linkedInCompanyUrlDto.urls.map(url => ({ url }));

      // Call BrightData API to trigger post discovery by company URL
      const brightDataResponse = await this.brightdataService.triggerDiscoverByCompanyUrl(
        datasetId,
        payload,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Post discovery started.`);

        return {
          success: true,
          message: `LinkedIn post discovery by company URL started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          company_urls: linkedInCompanyUrlDto.urls.length,
          instructions: {
            check_status: `GET /linkedin/post-discover-company/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/post-discover-company/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} posts`);

        // Save posts to database
        const savedPosts = await this.savePostsToDatabase(brightDataResponse, linkedInCompanyUrlDto.urls);

        return {
          success: true,
          message: `Successfully discovered ${savedPosts.length} LinkedIn posts from company URLs`,
          data: this.formatPostsForFrontend(brightDataResponse),
          saved_count: savedPosts.length,
          company_urls: linkedInCompanyUrlDto.urls.length,
        };
      }

      // Handle response with data property
      if (brightDataResponse?.data && Array.isArray(brightDataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightDataResponse.data.length} posts`);

        // Save posts to database
        const savedPosts = await this.savePostsToDatabase(brightDataResponse.data, linkedInCompanyUrlDto.urls);

        return {
          success: true,
          message: `Successfully discovered ${savedPosts.length} LinkedIn posts from company URLs`,
          data: this.formatPostsForFrontend(brightDataResponse.data),
          saved_count: savedPosts.length,
          company_urls: linkedInCompanyUrlDto.urls.length,
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
      this.logger.error(`Error discovering LinkedIn posts by company URL: ${error.message}`);
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
   * Save posts to database with company metadata
   */
  private async savePostsToDatabase(postsData: any[], companyUrls: string[]): Promise<LinkedInPostDiscoverCompany[]> {
    const savedPosts: LinkedInPostDiscoverCompany[] = [];

    for (const postData of postsData) {
      try {
        // Check if post already exists
        const existingPost = await this.linkedInPostDiscoverCompanyRepository.findOne({
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
        const mappedPostData = this.mapPostData(postData, companyUrls);
        const post = this.linkedInPostDiscoverCompanyRepository.create(mappedPostData);
        const savedPost = await this.linkedInPostDiscoverCompanyRepository.save(post);

        savedPosts.push(savedPost);
        this.logger.log(`Saved discovered post: ${savedPost.post_id} - ${savedPost.title || 'No title'} from company: ${savedPost.company_name || 'Unknown'}`);
      } catch (error) {
        this.logger.error(`Error saving post ${postData.id || postData.post_id}: ${error.message}`);
        // Continue with other posts
      }
    }

    this.logger.log(`Successfully saved ${savedPosts.length} out of ${postsData.length} discovered posts`);
    return savedPosts;
  }

  /**
   * Extract company name from company URL
   */
  private extractCompanyNameFromUrl(url: string): string {
    try {
      const match = url.match(/linkedin\.com\/company\/([^/?]+)/);
      return match ? match[1].replace(/-/g, ' ') : 'Unknown Company';
    } catch (error) {
      return 'Unknown Company';
    }
  }

  /**
   * Find matching company URL for a post
   */
  private findMatchingCompanyUrl(postData: any, companyUrls: string[]): string {
    // Try to match based on user_url or use_url
    const userUrl = postData.use_url || postData.user_url || '';

    const matchingUrl = companyUrls.find(url => {
      const companyName = this.extractCompanyNameFromUrl(url);
      return userUrl.includes(companyName.replace(/\s+/g, '-').toLowerCase()) ||
             userUrl.includes(url.split('/company/')[1]?.split('?')[0] || '');
    });

    return matchingUrl || companyUrls[0] || '';
  }

  /**
   * Map BrightData post response to database entity format with company metadata
   */
  private mapPostData(postData: any, companyUrls: string[]): Partial<LinkedInPostDiscoverCompany> {
    const matchingCompanyUrl = this.findMatchingCompanyUrl(postData, companyUrls);
    const companyName = this.extractCompanyNameFromUrl(matchingCompanyUrl);

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
      company_url: matchingCompanyUrl,
      company_name: companyName,
      input_url: matchingCompanyUrl,
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
      // Company metadata
      company_info: {
        company_url: this.findMatchingCompanyUrl(post, [post.use_url || post.user_url || '']),
        company_name: this.extractCompanyNameFromUrl(post.use_url || post.user_url || ''),
      },
    }));
  }

  async getAllDiscoveredPosts() {
    return this.linkedInPostDiscoverCompanyRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredPostById(id: string) {
    return this.linkedInPostDiscoverCompanyRepository.findOne({ where: { id } });
  }

  async getDiscoveredPostByPostId(postId: string) {
    return this.linkedInPostDiscoverCompanyRepository.findOne({
      where: { post_id: postId },
    });
  }

  async getDiscoveredPostsByCompany(companyName: string) {
    return this.linkedInPostDiscoverCompanyRepository.find({
      where: { company_name: companyName },
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredPostsByAccountType(accountType: string) {
    return this.linkedInPostDiscoverCompanyRepository.find({
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

  async getSnapshotData(snapshotId: string, companyUrls: string[] = []) {
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
      const savedPosts = await this.savePostsToDatabase(postsData, companyUrls);

      this.logger.log(`Successfully processed ${savedPosts.length} discovered posts from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully discovered ${postsData.length} LinkedIn posts from company URLs`,
        data: this.formatPostsForFrontend(postsData),
        saved_count: savedPosts.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
