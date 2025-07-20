import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const CompanyUrlSchema = z.object({
  urls: z
    .array(z.string().url().regex(/linkedin\.com\/company/, 'Must be a LinkedIn company URL'))
    .min(1, 'At least one URL is required')
    .max(50, 'Maximum 50 URLs allowed'),
});

export class CompanyUrlDto extends createZodDto(CompanyUrlSchema) {}
