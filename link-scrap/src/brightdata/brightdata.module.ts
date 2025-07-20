import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BrightdataService } from './brightdata.service';

@Module({
  imports: [HttpModule],
  providers: [BrightdataService],
  exports: [BrightdataService],
})
export class BrightdataModule {}