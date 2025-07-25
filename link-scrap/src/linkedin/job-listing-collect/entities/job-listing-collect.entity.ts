import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('job_listings')
@Index(['user_id', 'created_at'])
export class JobListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  @Index()
  user_id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  job_posting_id: string;

  @Column({ nullable: true })
  title_id: string;

  @Column({ nullable: true })
  company_id: string;

  @Column()
  job_title: string;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  company_url: string;

  @Column({ nullable: true })
  company_logo: string;

  @Column({ nullable: true })
  job_location: string;

  @Column({ nullable: true })
  country_code: string;

  @Column({ nullable: true })
  job_seniority_level: string;

  @Column({ nullable: true })
  job_employment_type: string;

  @Column({ nullable: true })
  job_industries: string;

  @Column('text', { nullable: true })
  job_summary: string;

  @Column({ nullable: true })
  job_function: string;

  @Column({ default: 0 })
  job_num_applicants: number;

  @Column({ default: false })
  application_availability: boolean;

  @Column({ nullable: true })
  apply_link: string;

  @Column('jsonb', { nullable: true })
  base_salary: any;

  @Column({ nullable: true })
  job_base_pay_range: string;

  @Column('timestamp', { nullable: true })
  job_posted_date: Date | null;

  @Column({ nullable: true })
  job_posted_time: string;

  @Column('jsonb', { nullable: true })
  job_poster: any;

  @Column('text', { nullable: true })
  job_description_formatted: string;

  @Column('jsonb', { nullable: true })
  discovery_input: any;

  @Column('jsonb', { nullable: true })
  salary_standards: any;

  @Column()
  input_url: string;

  @Column()
  timestamp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
