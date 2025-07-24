import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schema for LinkedIn post discovery by URL request
export const LinkedInPostDiscoverUrlRequestSchema = z.object({
  urls: z.array(
    z.object({
      url: z.string().url('Must be a valid URL').describe('LinkedIn URL to discover posts from'),
      limit: z.number().int().min(1).max(100).optional().describe('Maximum number of posts to discover (1-100)')
    })
  ).min(1, 'At least one URL is required').max(10, 'Maximum 10 URLs allowed per request')
});

// Zod schema for LinkedIn post response
export const LinkedInPostSchema = z.object({
  id: z.string().describe('LinkedIn post ID'),
  url: z.string().url().describe('Post URL'),
  user_id: z.string().optional().describe('User ID of the post author'),
  use_url: z.string().url().optional().describe('Author profile URL'),
  post_type: z.string().optional().describe('Type of post (post, article, etc.)'),
  date_posted: z.union([z.string().datetime(), z.date()]).optional().describe('Date when the post was published'),
  title: z.string().optional().describe('Post title'),
  headline: z.string().optional().describe('Post headline'),
  post_text: z.string().optional().describe('Plain text content of the post'),
  post_text_html: z.string().optional().describe('HTML content of the post'),
  hashtags: z.array(z.string()).optional().describe('Hashtags used in the post'),
  embedded_links: z.array(z.string().url()).optional().describe('Links embedded in the post'),
  images: z.array(z.string().url()).optional().describe('Image URLs attached to the post'),
  videos: z.any().optional().describe('Video content attached to the post'),
  video_duration: z.string().optional().describe('Duration of video content'),
  repost: z.object({
    repost_attachments: z.any().optional(),
    repost_date: z.string().optional(),
    repost_hangtags: z.any().optional(),
    repost_id: z.string().optional(),
    repost_text: z.string().optional(),
    repost_url: z.string().optional(),
    repost_user_id: z.string().optional(),
    repost_user_name: z.string().optional(),
    repost_user_title: z.string().optional(),
    tagged_companies: z.any().optional(),
    tagged_users: z.any().optional()
  }).optional().describe('Repost information if this is a repost'),
  num_likes: z.number().int().min(0).describe('Number of likes on the post'),
  num_comments: z.number().int().min(0).describe('Number of comments on the post'),
  top_visible_comments: z.any().optional().describe('Top visible comments'),
  user_title: z.string().optional().describe('Author job title'),
  author_profile_pic: z.string().url().optional().describe('Author profile picture URL'),
  num_connections: z.number().int().min(0).optional().describe('Number of connections of the author'),
  user_followers: z.number().int().min(0).describe('Number of followers of the author'),
  account_type: z.string().optional().describe('Type of account (Person, Organization, etc.)'),
  more_articles_by_user: z.any().optional().describe('More articles by the same user'),
  more_relevant_posts: z.any().optional().describe('More relevant posts'),
  user_posts: z.number().int().min(0).describe('Total number of posts by the user'),
  user_articles: z.number().int().min(0).describe('Total number of articles by the user'),
  tagged_companies: z.array(z.any()).optional().describe('Companies tagged in the post'),
  tagged_people: z.array(z.any()).optional().describe('People tagged in the post'),
  external_link_data: z.any().optional().describe('External link data'),
  video_thumbnail: z.string().url().optional().describe('Video thumbnail URL'),
  document_cover_image: z.string().url().optional().describe('Document cover image URL'),
  document_page_count: z.number().int().min(0).optional().describe('Number of pages in document')
});

// Zod schema for API response
export const LinkedInPostDiscoverUrlResponseSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful'),
  message: z.string().describe('Response message'),
  snapshot_id: z.string().optional().describe('Snapshot ID for tracking async operations'),
  status: z.string().optional().describe('Current status of the operation'),
  urls_count: z.number().int().min(0).optional().describe('Number of URLs processed'),
  instructions: z.object({
    check_status: z.string().describe('Endpoint to check operation status'),
    get_data: z.string().describe('Endpoint to retrieve discovered data')
  }).optional().describe('Instructions for next steps')
});

// Zod schema for paginated response
export const PaginatedLinkedInPostsSchema = z.object({
  data: z.array(LinkedInPostSchema).describe('Array of LinkedIn posts'),
  total: z.number().int().min(0).describe('Total number of posts'),
  page: z.number().int().min(1).describe('Current page number'),
  limit: z.number().int().min(1).describe('Number of items per page'),
  totalPages: z.number().int().min(0).describe('Total number of pages')
});

// Create DTOs using nestjs-zod
export class LinkedInPostDiscoverUrlRequestDto extends createZodDto(LinkedInPostDiscoverUrlRequestSchema) {}
export class LinkedInPostDto extends createZodDto(LinkedInPostSchema) {}
export class LinkedInPostDiscoverUrlResponseDto extends createZodDto(LinkedInPostDiscoverUrlResponseSchema) {}
export class PaginatedLinkedInPostsDto extends createZodDto(PaginatedLinkedInPostsSchema) {}

// Schemas are already exported above, no need to re-export
