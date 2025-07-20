import { PartialType } from '@nestjs/swagger';
import { CreatePeopleProfileDiscoverDto } from './create-people-profile-discover.dto';

export class UpdatePeopleProfileDiscoverDto extends PartialType(CreatePeopleProfileDiscoverDto) {}
