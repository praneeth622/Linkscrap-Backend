import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInJobUrlDto } from '../../brightdata/dto';
import { JobListing } from './entities/job-listing-collect.entity';

@Injectable()
export class JobListingCollectService {
  private readonly logger = new Logger(JobListingCollectService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(JobListing)
    private readonly jobListingRepository: Repository<JobListing>,
  ) {}

  async collectJobListings(linkedInJobUrlDto: LinkedInJobUrlDto, userId: string) {
    try {
      const datasetId = this.configService.get<string>('JOB_LISTING_COLLECT_DATASET_ID');

      if (!datasetId) {
        throw new Error('Job Listing Collect dataset ID is not configured');
      }

      // Transform URLs for BrightData API
      const payload = linkedInJobUrlDto.urls.map(url => ({ url }));

      this.logger.log(`Collecting job listings for ${payload.length} URLs`);

      // Call BrightData API to trigger data collection
      const brightDataResponse = await this.brightdataService.triggerDataset(
        datasetId,
        payload,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Data collection started.`);

        return {
          success: true,
          message: `Data collection started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          instructions: {
            check_status: `GET /linkedin/job-listing/collect/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/job-listing/collect/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse, userId);

        return {
          success: true,
          message: `Successfully collected ${savedJobListings.length} job listings`,
          data: brightDataResponse,
          saved_count: savedJobListings.length,
        };
      }

      // Handle response with data property
      if (brightDataResponse?.data && Array.isArray(brightDataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightDataResponse.data.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse.data, userId);

        return {
          success: true,
          message: `Successfully collected ${savedJobListings.length} job listings`,
          data: brightDataResponse.data,
          saved_count: savedJobListings.length,
        };
      }

      // If we reach here, the response format is unexpected
      this.logger.warn(`Unexpected response format from BrightData: ${JSON.stringify(brightDataResponse, null, 2)}`);

      return {
        success: false,
        message: 'Unexpected response format from BrightData API',
        raw_response: brightDataResponse,
      };
    } catch (error) {
      this.logger.error(`Error collecting job listings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for data collection to complete and retrieve the data
   */
  private async waitForDataAndRetrieve(snapshotId: string, maxWaitTime: number = 300000): Promise<any[]> {
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const progress = await this.brightdataService.monitorProgress(snapshotId);
        this.logger.log(`Snapshot ${snapshotId} status: ${progress.status}`);

        if (progress.status === 'ready') {
          // Download the snapshot data
          const snapshotData = await this.brightdataService.downloadSnapshot(snapshotId);
          return this.extractJobListingsFromResponse(snapshotData);
        }

        if (progress.status === 'failed') {
          throw new Error(`Data collection failed for snapshot ${snapshotId}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        this.logger.error(`Error monitoring progress for snapshot ${snapshotId}: ${error.message}`);
        throw error;
      }
    }

    throw new Error(`Timeout waiting for data collection to complete for snapshot ${snapshotId}`);
  }

  /**
   * Extract job listings from BrightData response
   */
  private extractJobListingsFromResponse(response: any): any[] {
    this.logger.debug(`Extracting job listings from response type: ${typeof response}`);

    if (Array.isArray(response)) {
      this.logger.log(`Found ${response.length} job listings in array response`);
      return response;
    }

    if (response?.data && Array.isArray(response.data)) {
      this.logger.log(`Found ${response.data.length} job listings in response.data`);
      return response.data;
    }

    if (response?.results && Array.isArray(response.results)) {
      this.logger.log(`Found ${response.results.length} job listings in response.results`);
      return response.results;
    }

    this.logger.warn(`No job listings found in response: ${JSON.stringify(response, null, 2)}`);
    return [];
  }

  /**
   * Save job listings to database
   */
  private async saveJobListingsToDatabase(jobListingsData: any[], userId: string): Promise<JobListing[]> {
    const savedJobListings: JobListing[] = [];

    for (const jobData of jobListingsData) {
      try {
        // Check if job listing already exists for this user
        const existingJobListing = await this.jobListingRepository.findOne({
          where: {
            job_posting_id: jobData.job_posting_id || jobData.id?.toString(),
            url: jobData.url || jobData.input_url,
            user_id: userId
          },
        });

        if (existingJobListing) {
          this.logger.log(`Job listing already exists: ${jobData.job_posting_id || jobData.id} - ${jobData.job_title}`);
          continue;
        }

        // Map and save new job listing
        const mappedJobData = this.mapJobListingData(jobData);

        // Add user_id to the mapped job data
        mappedJobData.user_id = userId;

        const jobListing = this.jobListingRepository.create(mappedJobData);
        const savedJobListing = await this.jobListingRepository.save(jobListing);

        savedJobListings.push(savedJobListing);
        this.logger.log(`Saved job listing: ${savedJobListing.job_title} at ${savedJobListing.company_name}`);
      } catch (error) {
        this.logger.error(`Error saving job listing ${jobData.job_posting_id || jobData.id}: ${error.message}`);
        // Continue with other job listings
      }
    }

    this.logger.log(`Successfully saved ${savedJobListings.length} out of ${jobListingsData.length} job listings`);
    return savedJobListings;
  }

  /**
   * Map BrightData job listing response to database entity format
   */
  private mapJobListingData(jobData: any): Partial<JobListing> {
    return {
      url: jobData.url || jobData.input_url,
      job_posting_id: jobData.job_posting_id?.toString() || jobData.id?.toString() || null,
      title_id: jobData.title_id?.toString() || null,
      company_id: jobData.company_id?.toString() || null,
      job_title: jobData.job_title || jobData.title,
      company_name: jobData.company_name || jobData.company,
      company_url: jobData.company_url,
      company_logo: jobData.company_logo,
      job_location: jobData.job_location || jobData.location,
      country_code: jobData.country_code,
      job_seniority_level: jobData.job_seniority_level || jobData.seniority_level,
      job_employment_type: jobData.job_employment_type || jobData.employment_type,
      job_industries: jobData.job_industries || jobData.industries,
      job_summary: jobData.job_summary || jobData.summary,
      job_function: jobData.job_function || jobData.function,
      job_num_applicants: parseInt(jobData.job_num_applicants) || 0,
      application_availability: jobData.application_availability || false,
      apply_link: jobData.apply_link,
      base_salary: jobData.base_salary || null,
      job_base_pay_range: jobData.job_base_pay_range,
      job_posted_date: jobData.job_posted_date ? new Date(jobData.job_posted_date) : null,
      job_posted_time: jobData.job_posted_time,
      job_poster: jobData.job_poster || null,
      job_description_formatted: jobData.job_description_formatted,
      discovery_input: jobData.discovery_input || null,
      salary_standards: jobData.salary_standards || null,
      input_url: jobData.url || jobData.input_url,
      timestamp: new Date().toISOString(),
    };
  }

  async getAllJobListings(userId: string) {
    return this.jobListingRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getJobListingById(id: string, userId: string) {
    return this.jobListingRepository.findOne({ where: { id, user_id: userId } });
  }

  async getJobListingByPostingId(postingId: string, userId: string) {
    return this.jobListingRepository.findOne({
      where: { job_posting_id: postingId, user_id: userId },
    });
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      const progress = await this.brightdataService.monitorProgress(snapshotId);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        dataset_id: progress.dataset_id,
        message: `Snapshot status: ${progress.status}`,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot status ${snapshotId}: ${error.message}`);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string, userId: string) {
    try {
      // Check snapshot status first
      const progress = await this.brightdataService.monitorProgress(snapshotId);

      if (progress.status !== 'ready') {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: progress.status,
          message: `Snapshot is not ready yet. Current status: ${progress.status}`,
        };
      }

      // Download the snapshot data
      const snapshotData = await this.brightdataService.downloadSnapshot(snapshotId);

      // Extract job listings from the downloaded data
      const jobListingsData = this.extractJobListingsFromResponse(snapshotData);

      // Save job listings to database
      const savedJobListings = await this.saveJobListingsToDatabase(jobListingsData, userId);

      this.logger.log(`Successfully processed ${savedJobListings.length} job listings from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully retrieved ${jobListingsData.length} job listings`,
        data: jobListingsData,
        saved_count: savedJobListings.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
