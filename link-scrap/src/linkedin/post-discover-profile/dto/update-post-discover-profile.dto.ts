import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDiscoverProfileDto } from './create-post-discover-profile.dto';

export class UpdatePostDiscoverProfileDto extends PartialType(CreatePostDiscoverProfileDto) {}
