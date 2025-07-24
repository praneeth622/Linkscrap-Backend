import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const LinkedInCompanyUrlSchema = z.object({
  urls: z
    .array(
      z.string()
        .url('Must be a valid URL')
        .regex(/linkedin\.com\/company/, 'Must be a LinkedIn company URL')
        .max(500, 'URL must be less than 500 characters')
    )
    .min(1, 'At least one URL is required')
    .max(50, 'Maximum 50 URLs allowed'),
});

export class LinkedInCompanyUrlDto extends createZodDto(LinkedInCompanyUrlSchema) {}
