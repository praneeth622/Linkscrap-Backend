import { PartialType } from '@nestjs/mapped-types';
import { CreateJobListingDiscoverKeywordDto } from './create-job-listing-discover-keyword.dto';

export class UpdateJobListingDiscoverKeywordDto extends PartialType(CreateJobListingDiscoverKeywordDto) {}
