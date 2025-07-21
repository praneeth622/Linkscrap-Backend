import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const LinkedInJobUrlSchema = z.object({
  urls: z
    .array(z.string().url().regex(/linkedin\.com\/jobs\/view/, 'Must be a LinkedIn job URL'))
    .min(1, 'At least one URL is required')
    .max(100, 'Maximum 100 URLs allowed'),
});

export class LinkedInJobUrlDto extends createZodDto(LinkedInJobUrlSchema) {}
