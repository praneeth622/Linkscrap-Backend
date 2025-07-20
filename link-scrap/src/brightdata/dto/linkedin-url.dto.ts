import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const LinkedInUrlSchema = z.object({
  urls: z
    .array(z.string().url().regex(/linkedin\.com\/in\//, 'Must be a LinkedIn profile URL'))
    .min(1, 'At least one URL is required')
    .max(100, 'Maximum 100 URLs allowed'),
});

export class LinkedInUrlDto extends createZodDto(LinkedInUrlSchema) {}