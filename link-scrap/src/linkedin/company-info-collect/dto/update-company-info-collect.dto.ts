import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyInfoCollectDto } from './create-company-info-collect.dto';

export class UpdateCompanyInfoCollectDto extends PartialType(CreateCompanyInfoCollectDto) {}
