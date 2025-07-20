import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('people_profiles')
export class PeopleProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  linkedin_num_id: string;

  @Column()
  url: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  country_code: string;

  @Column({ nullable: true })
  city: string;

  @Column('text', { nullable: true })
  about: string;

  @Column({ default: 0 })
  followers: number;

  @Column({ default: 0 })
  connections: number;

  @Column({ nullable: true })
  position: string;

  @Column('jsonb', { nullable: true })
  experience: any[];

  @Column('jsonb', { nullable: true })
  current_company: any;

  @Column({ nullable: true })
  current_company_name: string;

  @Column({ nullable: true })
  current_company_company_id: string;

  @Column('jsonb', { nullable: true })
  posts: any[];

  @Column('jsonb', { nullable: true })
  activity: any[];

  @Column('jsonb', { nullable: true })
  education: any[];

  @Column({ nullable: true })
  educations_details: string;

  @Column('jsonb', { nullable: true })
  courses: any[];

  @Column('jsonb', { nullable: true })
  certifications: any[];

  @Column('jsonb', { nullable: true })
  honors_and_awards: any[];

  @Column('jsonb', { nullable: true })
  volunteer_experience: any[];

  @Column('jsonb', { nullable: true })
  organizations: any[];

  @Column({ nullable: true })
  recommendations_count: number;

  @Column('jsonb', { nullable: true })
  recommendations: any[];

  @Column('jsonb', { nullable: true })
  languages: any[];

  @Column('jsonb', { nullable: true })
  projects: any[];

  @Column('jsonb', { nullable: true })
  patents: any[];

  @Column('jsonb', { nullable: true })
  publications: any[];

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  default_avatar: boolean;

  @Column({ nullable: true })
  banner_image: string;

  @Column('jsonb', { nullable: true })
  similar_profiles: any[];

  @Column('jsonb', { nullable: true })
  people_also_viewed: any[];

  @Column({ default: false })
  memorialized_account: boolean;

  @Column()
  input_url: string;

  @Column({ nullable: true })
  linkedin_id: string;

  @Column('jsonb', { nullable: true })
  bio_links: any[];

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  timestamp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}