import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDiscoverUrlDto } from './create-post-discover-url.dto';

export class UpdatePostDiscoverUrlDto extends PartialType(CreatePostDiscoverUrlDto) {}
