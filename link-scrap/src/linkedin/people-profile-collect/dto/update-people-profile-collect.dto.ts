import { PartialType } from '@nestjs/mapped-types';
import { CreatePeopleProfileCollectDto } from './create-people-profile-collect.dto';

export class UpdatePeopleProfileCollectDto extends PartialType(CreatePeopleProfileCollectDto) {}
