import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { JobSearchDto } from '../../brightdata/dto';
import { JobListingDiscover } from './entities/job-listing-discover-keyword.entity';

@Injectable()
export class JobListingDiscoverKeywordService {
  private readonly logger = new Logger(JobListingDiscoverKeywordService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(JobListingDiscover)
    private readonly jobListingDiscoverRepository: Repository<JobListingDiscover>,
  ) {}

  async discoverJobListings(jobSearchDto: JobSearchDto) {
    try {
      const datasetId = this.configService.get<string>('JOB_LISTING_DISCOVER_DATASET_ID');

      if (!datasetId) {
        throw new Error('Job Listing Discover dataset ID is not configured');
      }

      this.logger.log(`Discovering job listings for ${jobSearchDto.searches.length} search queries`);

      // Call BrightData API to trigger job discovery by keyword
      const brightDataResponse = await this.brightdataService.triggerDiscoverByKeyword(
        datasetId,
        jobSearchDto.searches,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Job discovery started.`);

        return {
          success: true,
          message: `Job discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          search_queries: jobSearchDto.searches.length,
          instructions: {
            check_status: `GET /linkedin/job-listing/discover-keyword/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/job-listing/discover-keyword/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse, jobSearchDto.searches);

        return {
          success: true,
          message: `Successfully discovered ${savedJobListings.length} job listings`,
          data: brightDataResponse,
          saved_count: savedJobListings.length,
          search_queries: jobSearchDto.searches.length,
        };
      }

      // Handle response with data property
      if (brightDataResponse?.data && Array.isArray(brightDataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightDataResponse.data.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse.data, jobSearchDto.searches);

        return {
          success: true,
          message: `Successfully discovered ${savedJobListings.length} job listings`,
          data: brightDataResponse.data,
          saved_count: savedJobListings.length,
          search_queries: jobSearchDto.searches.length,
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
      this.logger.error(`Error discovering job listings: ${error.message}`);
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
          throw new Error(`Job discovery failed for snapshot ${snapshotId}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        this.logger.error(`Error monitoring progress for snapshot ${snapshotId}: ${error.message}`);
        throw error;
      }
    }

    throw new Error(`Timeout waiting for job discovery to complete for snapshot ${snapshotId}`);
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
   * Save job listings to database with search metadata
   */
  private async saveJobListingsToDatabase(jobListingsData: any[], searchQueries: any[]): Promise<JobListingDiscover[]> {
    const savedJobListings: JobListingDiscover[] = [];

    for (const jobData of jobListingsData) {
      try {
        // Check if job listing already exists
        const existingJobListing = await this.jobListingDiscoverRepository.findOne({
          where: {
            job_posting_id: jobData.job_posting_id || jobData.id?.toString(),
            url: jobData.url || jobData.input_url
          },
        });

        if (existingJobListing) {
          this.logger.log(`Job listing already exists: ${jobData.job_posting_id || jobData.id} - ${jobData.job_title}`);
          continue;
        }

        // Find matching search query based on discovery_input
        const matchingSearch = this.findMatchingSearchQuery(jobData, searchQueries);

        // Map and save new job listing
        const mappedJobData = this.mapJobListingData(jobData, matchingSearch);
        const jobListing = this.jobListingDiscoverRepository.create(mappedJobData);
        const savedJobListing = await this.jobListingDiscoverRepository.save(jobListing);

        savedJobListings.push(savedJobListing);
        this.logger.log(`Saved discovered job listing: ${savedJobListing.job_title} at ${savedJobListing.company_name}`);
      } catch (error) {
        this.logger.error(`Error saving job listing ${jobData.job_posting_id || jobData.id}: ${error.message}`);
        // Continue with other job listings
      }
    }

    this.logger.log(`Successfully saved ${savedJobListings.length} out of ${jobListingsData.length} discovered job listings`);
    return savedJobListings;
  }

  /**
   * Find matching search query for a job listing based on discovery_input
   */
  private findMatchingSearchQuery(jobData: any, searchQueries: any[]): any | null {
    if (!jobData.discovery_input) {
      return searchQueries[0] || null; // Default to first search if no discovery input
    }

    // Try to match based on keyword and location
    const discoveryInput = jobData.discovery_input;
    return searchQueries.find(search =>
      search.keyword === discoveryInput.keyword ||
      search.location === discoveryInput.location
    ) || searchQueries[0] || null;
  }

  /**
   * Map BrightData job listing response to database entity format with search metadata
   */
  private mapJobListingData(jobData: any, searchQuery: any): Partial<JobListingDiscover> {
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
      // Search metadata
      search_keyword: searchQuery?.keyword || null,
      search_location: searchQuery?.location || null,
      search_country: searchQuery?.country || null,
      search_time_range: searchQuery?.time_range || null,
      search_job_type: searchQuery?.job_type || null,
      search_experience_level: searchQuery?.experience_level || null,
      search_remote: searchQuery?.remote || null,
      search_company: searchQuery?.company || null,
      search_location_radius: searchQuery?.location_radius || null,
    };
  }

  async getAllDiscoveredJobListings() {
    return this.jobListingDiscoverRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredJobListingById(id: string) {
    return this.jobListingDiscoverRepository.findOne({ where: { id } });
  }

  async getDiscoveredJobListingByPostingId(postingId: string) {
    return this.jobListingDiscoverRepository.findOne({
      where: { job_posting_id: postingId },
    });
  }

  async getDiscoveredJobListingsByKeyword(keyword: string) {
    return this.jobListingDiscoverRepository.find({
      where: { search_keyword: keyword },
      order: { created_at: 'DESC' },
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

  async getSnapshotData(snapshotId: string, searchQueries: any[] = []) {
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
      const savedJobListings = await this.saveJobListingsToDatabase(jobListingsData, searchQueries);

      this.logger.log(`Successfully processed ${savedJobListings.length} discovered job listings from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully discovered ${jobListingsData.length} job listings`,
        data: jobListingsData,
        saved_count: savedJobListings.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
