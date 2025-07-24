import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schema for LinkedIn people search request
export const LinkedInPeopleSearchRequestSchema = z.object({
  searches: z.array(
    z.object({
      url: z.string().url('Must be a valid URL').describe('LinkedIn base URL for search'),
      first_name: z.string().min(1, 'First name is required').describe('First name to search for'),
      last_name: z.string().min(1, 'Last name is required').describe('Last name to search for')
    })
  ).min(1, 'At least one search criteria is required').max(10, 'Maximum 10 searches allowed per request')
});

// Zod schema for LinkedIn person response
export const LinkedInPersonSchema = z.object({
  name: z.string().describe('Full name of the person'),
  subtitle: z.string().optional().describe('Professional subtitle or job title'),
  location: z.string().optional().describe('Geographic location'),
  experience: z.string().optional().describe('Current or recent work experience'),
  education: z.string().optional().describe('Educational background'),
  avatar: z.string().url().optional().describe('Profile picture URL'),
  url: z.string().url().describe('LinkedIn profile URL'),
  search_first_name: z.string().optional().describe('First name used in search'),
  search_last_name: z.string().optional().describe('Last name used in search'),
  search_url: z.string().url().optional().describe('URL used in search'),
  input_url: z.string().url().optional().describe('Original input URL'),
  timestamp: z.string().optional().describe('Timestamp when data was collected')
});

// Zod schema for API response
export const LinkedInPeopleSearchResponseSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful'),
  message: z.string().describe('Response message'),
  snapshot_id: z.string().optional().describe('Snapshot ID for tracking async operations'),
  status: z.string().optional().describe('Current status of the operation'),
  searches_count: z.number().int().min(0).optional().describe('Number of searches processed'),
  instructions: z.object({
    check_status: z.string().describe('Endpoint to check operation status'),
    get_data: z.string().describe('Endpoint to retrieve collected data')
  }).optional().describe('Instructions for next steps')
});

// Zod schema for paginated response
export const PaginatedLinkedInPeopleSchema = z.object({
  data: z.array(LinkedInPersonSchema).describe('Array of LinkedIn people'),
  total: z.number().int().min(0).describe('Total number of people'),
  page: z.number().int().min(1).describe('Current page number'),
  limit: z.number().int().min(1).describe('Number of items per page'),
  totalPages: z.number().int().min(0).describe('Total number of pages')
});

// Zod schema for search criteria
export const SearchCriteriaSchema = z.object({
  first_name: z.string().optional().describe('First name filter'),
  last_name: z.string().optional().describe('Last name filter'),
  location: z.string().optional().describe('Location filter'),
  experience: z.string().optional().describe('Experience filter')
});

// Create DTOs using nestjs-zod
export class LinkedInPeopleSearchRequestDto extends createZodDto(LinkedInPeopleSearchRequestSchema) {}
export class LinkedInPersonDto extends createZodDto(LinkedInPersonSchema) {}
export class LinkedInPeopleSearchResponseDto extends createZodDto(LinkedInPeopleSearchResponseSchema) {}
export class PaginatedLinkedInPeopleDto extends createZodDto(PaginatedLinkedInPeopleSchema) {}
export class SearchCriteriaDto extends createZodDto(SearchCriteriaSchema) {}

// Schemas are already exported above, no need to re-export
