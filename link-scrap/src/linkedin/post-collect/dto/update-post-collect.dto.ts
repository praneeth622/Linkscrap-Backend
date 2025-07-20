import { PartialType } from '@nestjs/mapped-types';
import { CreatePostCollectDto } from './create-post-collect.dto';

export class UpdatePostCollectDto extends PartialType(CreatePostCollectDto) {}
