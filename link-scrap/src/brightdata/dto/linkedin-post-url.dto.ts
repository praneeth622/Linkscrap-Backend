import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const LinkedInPostUrlSchema = z.object({
  urls: z
    .array(
      z.string()
        .url('Must be a valid URL')
        .regex(/linkedin\.com\/(posts|pulse)/, 'Must be a LinkedIn post or pulse URL')
        .max(500, 'URL must be less than 500 characters')
    )
    .min(1, 'At least one URL is required')
    .max(50, 'Maximum 50 URLs allowed'),
});

export class LinkedInPostUrlDto extends createZodDto(LinkedInPostUrlSchema) {}
