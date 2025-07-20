import { PartialType } from '@nestjs/mapped-types';
import { CreatePeopleSearchDto } from './create-people-search.dto';

export class UpdatePeopleSearchDto extends PartialType(CreatePeopleSearchDto) {}
