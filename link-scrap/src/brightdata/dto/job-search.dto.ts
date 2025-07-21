import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const JobSearchSchema = z.object({
  searches: z
    .array(
      z.object({
        location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
        keyword: z.string().min(1, 'Keyword is required').max(200, 'Keyword must be less than 200 characters'),
        country: z.string().max(10, 'Country code must be less than 10 characters').optional(),
        time_range: z.enum(['Past 24 hours', 'Past week', 'Past month', 'Any time']).optional(),
        job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Temporary', 'Volunteer', 'Internship', 'Other']).optional(),
        experience_level: z.enum(['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive']).optional(),
        remote: z.enum(['On-site', 'Remote', 'Hybrid']).optional(),
        company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
        location_radius: z.string().max(50, 'Location radius must be less than 50 characters').optional(),
      })
    )
    .min(1, 'At least one search is required')
    .max(50, 'Maximum 50 searches allowed'),
});

export class JobSearchDto extends createZodDto(JobSearchSchema) {}
