import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum RequestType {
  PEOPLE_PROFILE_COLLECT = 'people_profile_collect',
  PEOPLE_PROFILE_DISCOVER = 'people_profile_discover',
  COMPANY_INFO_COLLECT = 'company_info_collect',
  JOB_LISTING_COLLECT = 'job_listing_collect',
  JOB_LISTING_DISCOVER_KEYWORD = 'job_listing_discover_keyword',
  JOB_LISTING_DISCOVER_URL = 'job_listing_discover_url',
  POST_COLLECT = 'post_collect',
  POST_DISCOVER_COMPANY = 'post_discover_company',
  POST_DISCOVER_PROFILE = 'post_discover_profile',
  POST_DISCOVER_URL = 'post_discover_url',
  PEOPLE_SEARCH = 'people_search',
}

@Entity('linkedin_requests')
@Index(['status', 'requestType'])
@Index(['createdAt'])
export class LinkedinRequest extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RequestType,
  })
  requestType: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column('jsonb')
  requestPayload: Record<string, any>;

  @Column('jsonb', { nullable: true })
  responseData: Record<string, any>;

  @Column({ nullable: true })
  brightdataJobId: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;
}