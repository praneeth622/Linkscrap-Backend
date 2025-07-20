import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const PeopleNameSearchSchema = z.object({
  names: z
    .array(
      z.object({
        first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
        last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
      })
    )
    .min(1, 'At least one name is required')
    .max(50, 'Maximum 50 names allowed'),
});

export class PeopleNameSearchDto extends createZodDto(PeopleNameSearchSchema) {}
