import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { JobDiscoveryUrlDto } from '../../brightdata/dto';
import { JobListingDiscoverUrl } from './entities/job-listing-discover-url.entity';

@Injectable()
export class JobListingDiscoverUrlService {
  private readonly logger = new Logger(JobListingDiscoverUrlService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(JobListingDiscoverUrl)
    private readonly jobListingDiscoverUrlRepository: Repository<JobListingDiscoverUrl>,
  ) {}

  async discoverJobListingsByUrl(jobDiscoveryUrlDto: JobDiscoveryUrlDto) {
    try {
      const datasetId = this.configService.get<string>('JOB_LISTING_DISCOVER_URL_DATASET_ID');

      if (!datasetId) {
        throw new Error('Job Listing Discover URL dataset ID is not configured');
      }

      this.logger.log(`Discovering job listings for ${jobDiscoveryUrlDto.urls.length} URLs`);

      // Transform URLs for BrightData API
      const payload = jobDiscoveryUrlDto.urls.map(url => ({ url }));

      // Call BrightData API to trigger job discovery by URL
      const brightDataResponse = await this.brightdataService.triggerDiscoverByUrl(
        datasetId,
        payload,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Job discovery by URL started.`);

        return {
          success: true,
          message: `Job discovery by URL started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          discovery_urls: jobDiscoveryUrlDto.urls.length,
          instructions: {
            check_status: `GET /linkedin/job-listing/discover-url/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/job-listing/discover-url/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse, jobDiscoveryUrlDto.urls);

        return {
          success: true,
          message: `Successfully discovered ${savedJobListings.length} job listings from URLs`,
          data: brightDataResponse,
          saved_count: savedJobListings.length,
          discovery_urls: jobDiscoveryUrlDto.urls.length,
        };
      }

      // Handle response with data property
      if (brightDataResponse?.data && Array.isArray(brightDataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightDataResponse.data.length} job listings`);

        // Save job listings to database
        const savedJobListings = await this.saveJobListingsToDatabase(brightDataResponse.data, jobDiscoveryUrlDto.urls);

        return {
          success: true,
          message: `Successfully discovered ${savedJobListings.length} job listings from URLs`,
          data: brightDataResponse.data,
          saved_count: savedJobListings.length,
          discovery_urls: jobDiscoveryUrlDto.urls.length,
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
      this.logger.error(`Error discovering job listings by URL: ${error.message}`);
      throw error;
    }
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
   * Save job listings to database with URL metadata
   */
  private async saveJobListingsToDatabase(jobListingsData: any[], discoveryUrls: string[]): Promise<JobListingDiscoverUrl[]> {
    const savedJobListings: JobListingDiscoverUrl[] = [];

    for (const jobData of jobListingsData) {
      try {
        // Check if job listing already exists
        const existingJobListing = await this.jobListingDiscoverUrlRepository.findOne({
          where: {
            job_posting_id: jobData.job_posting_id || jobData.id?.toString(),
            url: jobData.url || jobData.input_url
          },
        });

        if (existingJobListing) {
          this.logger.log(`Job listing already exists: ${jobData.job_posting_id || jobData.id} - ${jobData.job_title}`);
          continue;
        }

        // Find matching discovery URL
        const matchingDiscoveryUrl = this.findMatchingDiscoveryUrl(jobData, discoveryUrls);

        // Map and save new job listing
        const mappedJobData = this.mapJobListingData(jobData, matchingDiscoveryUrl || '');
        const jobListing = this.jobListingDiscoverUrlRepository.create(mappedJobData);
        const savedJobListing = await this.jobListingDiscoverUrlRepository.save(jobListing);

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
   * Find matching discovery URL for a job listing
   */
  private findMatchingDiscoveryUrl(jobData: any, discoveryUrls: string[]): string | null {
    // Try to match based on company or other criteria
    // For now, return the first URL as default
    return discoveryUrls[0] || null;
  }

  /**
   * Determine URL type based on the URL pattern
   */
  private determineUrlType(url: string): string {
    if (url.includes('/jobs/search')) {
      return 'search';
    } else if (url.includes('-jobs')) {
      return 'company';
    } else {
      return 'general';
    }
  }

  /**
   * Map BrightData job listing response to database entity format with URL metadata
   */
  private mapJobListingData(jobData: any, discoveryUrl: string): Partial<JobListingDiscoverUrl> {
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
      // URL discovery metadata
      discovery_url: discoveryUrl,
      discovery_url_type: discoveryUrl ? this.determineUrlType(discoveryUrl) : undefined,
    };
  }

  async getAllDiscoveredJobListings() {
    return this.jobListingDiscoverUrlRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredJobListingById(id: string) {
    return this.jobListingDiscoverUrlRepository.findOne({ where: { id } });
  }

  async getDiscoveredJobListingByPostingId(postingId: string) {
    return this.jobListingDiscoverUrlRepository.findOne({
      where: { job_posting_id: postingId },
    });
  }

  async getDiscoveredJobListingsByUrlType(urlType: string) {
    return this.jobListingDiscoverUrlRepository.find({
      where: { discovery_url_type: urlType },
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

  async getSnapshotData(snapshotId: string, discoveryUrls: string[] = []) {
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
      const savedJobListings = await this.saveJobListingsToDatabase(jobListingsData, discoveryUrls);

      this.logger.log(`Successfully processed ${savedJobListings.length} discovered job listings from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully discovered ${jobListingsData.length} job listings from URLs`,
        data: jobListingsData,
        saved_count: savedJobListings.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
