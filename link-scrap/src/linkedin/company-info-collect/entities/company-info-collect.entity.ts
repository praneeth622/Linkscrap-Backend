import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

@Entity('company_info')
@Index(['user_id', 'createdAt'])
@Index(['user_id', 'company_id'], { unique: true })
export class CompanyInfoEntity extends BaseEntity {
  @Column('uuid', { nullable: true })
  @Index()
  user_id: string;

  @Column({ type: 'varchar' })
  company_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ type: 'varchar', nullable: true })
  url?: string;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'varchar', nullable: true })
  background_image_url?: string;

  @Column({ type: 'int', nullable: true })
  followers?: number;

  @Column({ type: 'varchar', nullable: true })
  organization_type?: string;

  @Column({ type: 'int', nullable: true })
  employees?: number;

  @Column({ type: 'varchar', nullable: true })
  employees_range?: string;

  @Column({ type: 'varchar', nullable: true })
  headquarters?: string;

  @Column({ type: 'varchar', nullable: true })
  founded?: string;

  @Column({ type: 'simple-array', nullable: true })
  industries?: string[];

  @Column({ type: 'text', nullable: true })
  headquarters_geolocation?: string;

  @Column({ type: 'text', nullable: true })
  specialities?: string;

  @Column({ type: 'json', nullable: true })
  locations?: Array<{
    description?: string;
    is_hq?: boolean;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    address?: string;
    address_2?: string;
    street?: string;
    is_primary?: boolean;
    geographic_area?: string;
    lat?: string;
    lng?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  social_media?: Array<{
    name?: string;
    url?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  employees_insights?: Array<{
    insight_type?: string;
    value?: number;
    label?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  funding?: Array<{
    money_raised?: number;
    money_raised_currency?: string;
    announced_date?: string;
    funding_stage?: string;
    money_raised_formatted?: string;
    lead_investors?: string[];
    total_investors?: number;
    investor_types?: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  acquisitions?: Array<{
    company_name?: string;
    announced_date?: string;
    price?: string;
    acquisition_type?: string;
    industries?: string[];
    company_url?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  similar_companies?: Array<{
    name?: string;
    url?: string;
    image_url?: string;
    followers?: number;
    industry?: string;
    company_id?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  affiliated_pages?: Array<{
    name?: string;
    url?: string;
    image_url?: string;
    followers?: number;
    industry?: string;
    company_id?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  showcase_pages?: Array<{
    name?: string;
    url?: string;
    image_url?: string;
    followers?: number;
    industry?: string;
    company_id?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  featured_groups?: Array<{
    name?: string;
    url?: string;
    image_url?: string;
    members?: number;
    group_id?: string;
  }>;

  @Column({ type: 'json', nullable: true })
  updates?: Array<{
    update_id?: string;
    url?: string;
    text?: string;
    posted_date?: string;
    image_url?: string;
    total_reactions?: number;
    reactions?: Array<{
      type?: string;
      count?: number;
    }>;
  }>;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  original_request_url?: string;

  @Column({ type: 'json', nullable: true })
  raw_data?: any;

  @Column({ type: 'varchar', nullable: true })
  data_source?: string;

  @Column({ type: 'varchar', nullable: true })
  collection_status?: string;

  @Column({ type: 'varchar', nullable: true })
  collection_error?: string;

  @Column({ type: 'varchar', nullable: true })
  brightdata_input?: string;

  @Column({ type: 'timestamp', nullable: true })
  collected_at?: Date;
}
