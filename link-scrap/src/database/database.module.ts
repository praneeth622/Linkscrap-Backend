import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedinRequest } from '../entities';
import { DatabaseService } from './database.service';

@Module({
  imports: [TypeOrmModule.forFeature([LinkedinRequest])],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}