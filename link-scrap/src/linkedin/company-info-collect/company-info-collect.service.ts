import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { CompanyUrlDto } from '../../brightdata/dto';
import { CompanyInfoEntity } from './entities';

@Injectable()
export class CompanyInfoCollectService {
  private readonly logger = new Logger(CompanyInfoCollectService.name);

  constructor(
    @InjectRepository(CompanyInfoEntity)
    private companyInfoRepository: Repository<CompanyInfoEntity>,
    private brightdataService: BrightdataService,
  ) {}

  async collectCompanyInfo(companyUrlDto: CompanyUrlDto) {
    this.logger.log('Starting company info collection for URLs: ' + JSON.stringify(companyUrlDto.urls));

    const datasetId = 'gd_l1vikfnt1wgvvqz95w'; // BrightData Company Information dataset ID

    try {
      // Transform URLs to the format expected by BrightData
      const payload = companyUrlDto.urls.map(url => ({ url }));

      this.logger.log(`Collecting company info for ${payload.length} URLs`);

      const brightdataResponse = await this.brightdataService.triggerDataset(datasetId, payload);

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightdataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightdataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightdataResponse.snapshot_id}, waiting for company data collection to complete...`);

        // Wait for data collection to complete and get the actual company data
        const companyData = await this.waitForDataAndRetrieve(brightdataResponse.snapshot_id);

        // Save companies to database
        const savedCompanies = await this.saveCompaniesToDatabase(companyData, companyUrlDto.urls);

        this.logger.log(`Successfully processed ${savedCompanies.length} companies`);

        return {
          success: true,
          message: `Successfully collected ${companyData.length} companies`,
          data: companyData,
          saved_count: savedCompanies.length,
          snapshot_id: brightdataResponse.snapshot_id,
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightdataResponse)) {
        this.logger.log(`Received direct response with ${brightdataResponse.length} companies`);

        // Save companies to database
        const savedCompanies = await this.saveCompaniesToDatabase(brightdataResponse, companyUrlDto.urls);

        return {
          success: true,
          message: `Successfully collected ${savedCompanies.length} companies`,
          data: brightdataResponse,
          saved_count: savedCompanies.length,
        };
      }

      // Handle response with data property
      if (brightdataResponse?.data && Array.isArray(brightdataResponse.data)) {
        this.logger.log(`Received response with data property containing ${brightdataResponse.data.length} companies`);

        // Save companies to database
        const savedCompanies = await this.saveCompaniesToDatabase(brightdataResponse.data, companyUrlDto.urls);

        return {
          success: true,
          message: `Successfully collected ${savedCompanies.length} companies`,
          data: brightdataResponse.data,
          saved_count: savedCompanies.length,
        };
      }

      // Unexpected response format
      this.logger.warn(`Unexpected response format from BrightData: ${JSON.stringify(brightdataResponse)}`);
      return {
        success: false,
        message: 'Unexpected response format from BrightData',
        response: brightdataResponse
      };
      
    } catch (error) {
      this.logger.error('Error collecting company info: ', error);
      
      // Save failed attempts to database
      const failedResults: CompanyInfoEntity[] = [];
      for (const url of companyUrlDto.urls) {
        const failedEntity = this.companyInfoRepository.create({
          company_id: this.extractCompanyId(url),
          name: 'Failed Collection',
          url: url,
          original_request_url: url,
          data_source: 'brightdata',
          collection_status: 'error',
          collection_error: error.message,
          brightdata_input: JSON.stringify({ url }),
          collected_at: new Date(),
        });

        const savedEntity = await this.companyInfoRepository.save(failedEntity);
        failedResults.push(savedEntity);
      }
      
      return {
        success: false,
        message: 'Failed to collect company info',
        error: error.message,
        data: failedResults,
      };
    }
  }

  /**
   * Wait for BrightData collection to complete and retrieve the actual company data
   */
  private async waitForDataAndRetrieve(snapshotId: string, maxWaitTime: number = 300000, pollInterval: number = 5000): Promise<any[]> {
    const startTime = Date.now();

    this.logger.log(`Starting to poll for snapshot completion: ${snapshotId}`);

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check progress
        const progress = await this.brightdataService.monitorProgress(snapshotId);
        this.logger.debug(`Progress status: ${progress.status}`);

        if (progress.status === 'completed' || progress.status === 'ready') {
          this.logger.log(`Data collection completed for snapshot: ${snapshotId}`);

          // Download the actual data
          const snapshotData = await this.brightdataService.downloadSnapshot(snapshotId);

          // Extract companies from the downloaded data
          return this.extractCompaniesFromResponse(snapshotData);
        } else if (progress.status === 'failed' || progress.status === 'error') {
          this.logger.error(`Data collection failed for snapshot: ${snapshotId}`);
          throw new Error(`BrightData collection failed with status: ${progress.status}`);
        } else {
          // Still running, wait and poll again
          this.logger.debug(`Data collection still in progress (${progress.status}), waiting ${pollInterval}ms...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        this.logger.error(`Error while polling for snapshot ${snapshotId}: ${error.message}`);

        // If it's a timeout or network error, continue polling
        if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
          this.logger.warn('Network error while polling, retrying...');
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    // Timeout reached
    this.logger.warn(`Timeout reached while waiting for snapshot ${snapshotId} to complete`);
    throw new Error(`Timeout: Data collection did not complete within ${maxWaitTime / 1000} seconds`);
  }

  /**
   * Extract companies array from BrightData response
   */
  private extractCompaniesFromResponse(response: any): any[] {
    this.logger.log(`Extracting companies from response type: ${typeof response}`);

    // If response is null or undefined
    if (!response) {
      this.logger.warn('BrightData response is null or undefined');
      return [];
    }

    // If response is already an array
    if (Array.isArray(response)) {
      this.logger.log(`Response is array with ${response.length} items`);
      return response;
    }

    // If response is an object, try to find the companies array
    if (typeof response === 'object') {
      // Common property names that might contain the companies array
      const possibleArrayKeys = ['data', 'results', 'companies', 'items', 'records'];

      for (const key of possibleArrayKeys) {
        if (response[key] && Array.isArray(response[key])) {
          this.logger.log(`Found companies array in response.${key} with ${response[key].length} items`);
          return response[key];
        }
      }

      // If no array found in common keys, log the structure and return empty array
      this.logger.warn(`No companies array found in response. Available keys: ${Object.keys(response).join(', ')}`);
      return [];
    }

    // If response is neither array nor object
    this.logger.warn(`Unexpected response type: ${typeof response}`);
    return [];
  }

  private async saveCompaniesToDatabase(companies: any[], originalUrls: string[]): Promise<CompanyInfoEntity[]> {
    const savedCompanies: CompanyInfoEntity[] = [];

    if (!Array.isArray(companies)) {
      this.logger.error('Companies parameter is not an array');
      return savedCompanies;
    }

    if (companies.length === 0) {
      this.logger.warn('No companies to save to database');
      return savedCompanies;
    }

    this.logger.log(`Attempting to save ${companies.length} companies to database`);

    for (const companyData of companies) {
      try {
        if (!companyData || typeof companyData !== 'object') {
          this.logger.warn('Skipping invalid company data:', companyData);
          continue;
        }

        // Map BrightData response to database entity format
        const mappedCompany = this.mapCompanyData(companyData, originalUrls);

        // Check if company already exists
        const existingCompany = await this.companyInfoRepository.findOne({
          where: { company_id: mappedCompany.company_id },
        });

        if (existingCompany) {
          // Update existing company
          Object.assign(existingCompany, mappedCompany);
          const updated = await this.companyInfoRepository.save(existingCompany);
          savedCompanies.push(updated);
          this.logger.log(`Updated existing company: ${mappedCompany.company_id}`);
        } else {
          // Create new company
          const newCompany = this.companyInfoRepository.create(mappedCompany);
          const saved = await this.companyInfoRepository.save(newCompany);
          savedCompanies.push(saved);
          this.logger.log(`Saved new company: ${mappedCompany.company_id}`);
        }
      } catch (error) {
        this.logger.error(`Error saving company ${companyData?.company_id || companyData?.id || 'unknown'}: ${error.message}`);
        this.logger.error(`Company data: ${JSON.stringify(companyData, null, 2)}`);
      }
    }

    return savedCompanies;
  }

  /**
   * Map BrightData company response to database entity format
   */
  private mapCompanyData(companyData: any, originalUrls: string[]): Partial<CompanyInfoEntity> {
    // Find the original URL that matches this company
    const originalUrl = originalUrls.find(url =>
      companyData.url?.includes(this.extractCompanyId(url)) ||
      companyData.company_id === this.extractCompanyId(url)
    ) || originalUrls[0]; // fallback to first URL

    return {
      company_id: companyData.company_id || this.extractCompanyId(companyData.url || originalUrl),
      name: companyData.name || companyData.company_name || 'Unknown',
      website: companyData.website,
      phone: companyData.phone,
      description: companyData.description,
      about: companyData.about,
      url: companyData.url || originalUrl,
      image_url: companyData.image_url || companyData.logo_url,
      background_image_url: companyData.background_image_url || companyData.cover_image_url,
      followers: parseInt(companyData.followers) || undefined,
      organization_type: companyData.organization_type || companyData.company_type,
      employees: parseInt(companyData.employees) || undefined,
      employees_range: companyData.employees_range,
      headquarters: companyData.headquarters || companyData.location,
      founded: companyData.founded ? companyData.founded.toString() : undefined,
      industries: companyData.industries || [],
      headquarters_geolocation: companyData.headquarters_geolocation,
      specialities: companyData.specialities || companyData.specialties || [],
      locations: companyData.locations || [],
      social_media: companyData.social_media || {},
      employees_insights: companyData.employees_insights || {},
      funding: companyData.funding || {},
      acquisitions: companyData.acquisitions || [],
      similar_companies: companyData.similar_companies || [],
      affiliated_pages: companyData.affiliated_pages || [],
      showcase_pages: companyData.showcase_pages || [],
      featured_groups: companyData.featured_groups || [],
      updates: companyData.updates || [],
      original_request_url: originalUrl,
      raw_data: companyData,
      data_source: 'brightdata',
      collection_status: 'completed',
      brightdata_input: JSON.stringify({ url: originalUrl }),
      collected_at: new Date(),
    };
  }

  async findAll() {
    return this.companyInfoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.companyInfoRepository.findOne({
      where: { id },
    });
  }

  async findByCompanyId(companyId: string) {
    return this.companyInfoRepository.findOne({
      where: { company_id: companyId },
    });
  }

  async findByUrl(url: string) {
    return this.companyInfoRepository.find({
      where: { original_request_url: url },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const result = await this.companyInfoRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  private extractCompanyId(url: string): string {
    // Extract company identifier from LinkedIn URL
    const match = url.match(/\/company\/([^\/\?]+)/);
    if (match) {
      return match[1];
    }
    
    // Fallback to timestamp-based ID if extraction fails
    return `company_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
