import { PartialType } from '@nestjs/mapped-types';
import { CreateJobListingDiscoverUrlDto } from './create-job-listing-discover-url.dto';

export class UpdateJobListingDiscoverUrlDto extends PartialType(CreateJobListingDiscoverUrlDto) {}
