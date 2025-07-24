import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('linkedin_people_search_collect')
export class LinkedInPeopleSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  url: string;

  // Search criteria used to find this person
  @Column({ nullable: true })
  search_first_name: string;

  @Column({ nullable: true })
  search_last_name: string;

  @Column({ nullable: true })
  search_url: string;

  @Column()
  input_url: string;

  @Column()
  timestamp: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
