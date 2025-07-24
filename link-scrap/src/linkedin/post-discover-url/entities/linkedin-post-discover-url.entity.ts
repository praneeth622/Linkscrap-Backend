import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('linkedin_posts_discover_url')
export class LinkedInPostDiscoverUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  linkedin_post_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  use_url: string;

  @Column({ nullable: true })
  post_type: string;

  @Column({ type: 'timestamp', nullable: true })
  date_posted: Date | null;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  headline: string;

  @Column('text', { nullable: true })
  post_text: string;

  @Column('text', { nullable: true })
  post_text_html: string;

  @Column('jsonb', { nullable: true })
  hashtags: string[];

  @Column('jsonb', { nullable: true })
  embedded_links: string[];

  @Column('jsonb', { nullable: true })
  images: string[];

  @Column('jsonb', { nullable: true })
  videos: any;

  @Column({ nullable: true })
  video_duration: string;

  @Column('jsonb', { nullable: true })
  repost: {
    repost_attachments: any;
    repost_date: string;
    repost_hangtags: any;
    repost_id: string;
    repost_text: string;
    repost_url: string;
    repost_user_id: string;
    repost_user_name: string;
    repost_user_title: string;
    tagged_companies: any;
    tagged_users: any;
  };

  @Column({ default: 0 })
  num_likes: number;

  @Column({ default: 0 })
  num_comments: number;

  @Column('jsonb', { nullable: true })
  top_visible_comments: any;

  @Column({ nullable: true })
  user_title: string;

  @Column({ nullable: true })
  author_profile_pic: string;

  @Column({ nullable: true })
  num_connections: number;

  @Column({ default: 0 })
  user_followers: number;

  @Column({ nullable: true })
  account_type: string;

  @Column('jsonb', { nullable: true })
  more_articles_by_user: any;

  @Column('jsonb', { nullable: true })
  more_relevant_posts: any;

  @Column({ default: 0 })
  user_posts: number;

  @Column({ default: 0 })
  user_articles: number;

  @Column('jsonb', { nullable: true })
  tagged_companies: any[];

  @Column('jsonb', { nullable: true })
  tagged_people: any[];

  @Column('jsonb', { nullable: true })
  external_link_data: any;

  @Column({ nullable: true })
  video_thumbnail: string;

  @Column({ nullable: true })
  document_cover_image: string;

  @Column({ nullable: true })
  document_page_count: number;

  @Column()
  input_url: string;

  @Column()
  timestamp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
