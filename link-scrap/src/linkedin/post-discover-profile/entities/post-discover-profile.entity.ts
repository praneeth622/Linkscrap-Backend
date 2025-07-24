import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('linkedin_post_discover_profile')
export class LinkedInPostDiscoverProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', unique: true })
  post_id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', nullable: true })
  user_id?: string;

  @Column({ type: 'text', nullable: true })
  use_url?: string;

  @Column({ type: 'varchar', default: 'post' })
  post_type: string;

  @Column({ type: 'timestamp', nullable: true })
  date_posted?: Date;

  @Column({ type: 'text', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  headline?: string;

  @Column({ type: 'text', nullable: true })
  post_text?: string;

  @Column({ type: 'text', nullable: true })
  post_text_html?: string;

  @Column({ type: 'json', nullable: true })
  hashtags?: string[];

  @Column({ type: 'json', nullable: true })
  embedded_links?: string[];

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'json', nullable: true })
  videos?: any;

  @Column({ type: 'varchar', nullable: true })
  video_duration?: string;

  @Column({ type: 'json', nullable: true })
  repost?: any;

  @Column({ type: 'int', default: 0 })
  num_likes: number;

  @Column({ type: 'int', default: 0 })
  num_comments: number;

  @Column({ type: 'json', nullable: true })
  top_visible_comments?: any[];

  @Column({ type: 'varchar', nullable: true })
  user_title?: string;

  @Column({ type: 'text', nullable: true })
  author_profile_pic?: string;

  @Column({ type: 'int', nullable: true })
  num_connections?: number;

  @Column({ type: 'int', nullable: true })
  user_followers?: number;

  @Column({ type: 'varchar', nullable: true })
  account_type?: string;

  @Column({ type: 'json', nullable: true })
  more_articles_by_user?: any;

  @Column({ type: 'json', nullable: true })
  more_relevant_posts?: any;

  @Column({ type: 'int', default: 0 })
  user_posts: number;

  @Column({ type: 'int', default: 0 })
  user_articles: number;

  @Column({ type: 'json', nullable: true })
  tagged_companies?: any[];

  @Column({ type: 'json', nullable: true })
  tagged_people?: any[];

  @Column({ type: 'json', nullable: true })
  external_link_data?: any;

  @Column({ type: 'text', nullable: true })
  video_thumbnail?: string;

  @Column({ type: 'text', nullable: true })
  document_cover_image?: string;

  @Column({ type: 'int', nullable: true })
  document_page_count?: number;

  // Profile URL metadata
  @Column({ type: 'text' })
  profile_url: string;

  @Column({ type: 'varchar', nullable: true })
  profile_name?: string;

  @Column({ type: 'timestamp', nullable: true })
  discovery_start_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  discovery_end_date?: Date;

  // Discovery metadata
  @Column({ type: 'varchar', nullable: true })
  snapshot_id?: string;

  @Column({ type: 'json', nullable: true })
  discovery_input?: any;

  @Column({ type: 'text' })
  input_url: string;

  @Column({ type: 'text' })
  timestamp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
