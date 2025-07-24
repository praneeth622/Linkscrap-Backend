import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const LinkedInProfileUrlSchema = z.object({
  profiles: z
    .array(
      z.object({
        url: z.string()
          .url('Must be a valid URL')
          .regex(/linkedin\.com\/in\//, 'Must be a LinkedIn profile URL')
          .max(500, 'URL must be less than 500 characters'),
        start_date: z.string()
          .datetime('Must be a valid ISO datetime string')
          .optional()
          .describe('Start date for post discovery (ISO format)'),
        end_date: z.string()
          .datetime('Must be a valid ISO datetime string')
          .optional()
          .describe('End date for post discovery (ISO format)')
      })
      .refine(
        (data) => {
          if (data.start_date && data.end_date) {
            return new Date(data.start_date) <= new Date(data.end_date);
          }
          return true;
        },
        {
          message: 'Start date must be before or equal to end date',
          path: ['start_date']
        }
      )
    )
    .min(1, 'At least one profile is required')
    .max(50, 'Maximum 50 profiles allowed'),
});

export class LinkedInProfileUrlDto extends createZodDto(LinkedInProfileUrlSchema) {}
