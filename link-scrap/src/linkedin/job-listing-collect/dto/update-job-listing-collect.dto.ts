import { PartialType } from '@nestjs/mapped-types';
import { CreateJobListingCollectDto } from './create-job-listing-collect.dto';

export class UpdateJobListingCollectDto extends PartialType(CreateJobListingCollectDto) {}
