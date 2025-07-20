import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDiscoverCompanyDto } from './create-post-discover-company.dto';

export class UpdatePostDiscoverCompanyDto extends PartialType(CreatePostDiscoverCompanyDto) {}
