import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInUrlDto } from '../../brightdata/dto';
import { PeopleProfile } from './entities/people-profile.entity';

@Injectable()
export class PeopleProfileCollectService {
  private readonly logger = new Logger(PeopleProfileCollectService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(PeopleProfile)
    private readonly peopleProfileRepository: Repository<PeopleProfile>,
  ) {}

  async collectProfiles(linkedInUrlDto: LinkedInUrlDto, userId: string) {
    try {
      const datasetId = this.configService.get<string>('PEOPLE_PROFILE_COLLECT_DATASET_ID');

      if (!datasetId) {
        throw new Error('People Profile Collect dataset ID is not configured');
      }

      // Transform URLs for BrightData API
      const payload = linkedInUrlDto.urls.map(url => ({ url }));

      this.logger.log(`Collecting profiles for ${payload.length} URLs`);

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
            check_status: `GET /linkedin/people-profile/collect/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/people-profile/collect/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      } else {
        // Handle direct response (if any)
        const profilesData = this.extractProfilesFromResponse(brightDataResponse);
        const savedProfiles = await this.saveProfilesToDatabase(profilesData, userId);

        this.logger.log(`Successfully processed ${savedProfiles.length} profiles`);

        return {
          success: true,
          message: `Successfully collected ${savedProfiles.length} profiles`,
          data: profilesData,
          saved_count: savedProfiles.length,
        };
      }
    } catch (error) {
      this.logger.error(`Error collecting profiles: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for BrightData collection to complete and retrieve the actual profile data
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

          // Extract profiles from the downloaded data
          return this.extractProfilesFromResponse(snapshotData);
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
   * Extract profiles array from BrightData response
   * BrightData can return different response formats:
   * - Direct array: [profile1, profile2, ...]
   * - Object with data property: { data: [profile1, profile2, ...] }
   * - Object with results property: { results: [profile1, profile2, ...] }
   * - Other nested structures
   */
  private extractProfilesFromResponse(response: any): any[] {
    this.logger.log(`Extracting profiles from response type: ${typeof response}`);

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

    // If response is an object, try to find the profiles array
    if (typeof response === 'object') {
      // Common property names that might contain the profiles array
      const possibleArrayKeys = ['data', 'results', 'profiles', 'items', 'records'];

      for (const key of possibleArrayKeys) {
        if (response[key] && Array.isArray(response[key])) {
          this.logger.log(`Found profiles array in response.${key} with ${response[key].length} items`);
          return response[key];
        }
      }

      // If no array found in common keys, log the structure and return empty array
      this.logger.warn(`No profiles array found in response. Available keys: ${Object.keys(response).join(', ')}`);
      return [];
    }

    // If response is neither array nor object
    this.logger.warn(`Unexpected response type: ${typeof response}`);
    return [];
  }

  private async saveProfilesToDatabase(profiles: any[], userId: string): Promise<PeopleProfile[]> {
    const savedProfiles: PeopleProfile[] = [];

    if (!Array.isArray(profiles)) {
      this.logger.error('Profiles parameter is not an array');
      return savedProfiles;
    }

    if (profiles.length === 0) {
      this.logger.warn('No profiles to save to database');
      return savedProfiles;
    }

    this.logger.log(`Attempting to save ${profiles.length} profiles to database`);

    for (const profileData of profiles) {
      try {
        if (!profileData || typeof profileData !== 'object') {
          this.logger.warn('Skipping invalid profile data:', profileData);
          continue;
        }

        // Map BrightData response to database entity format
        const mappedProfile = this.mapProfileData(profileData);

        // Add user_id to the mapped profile
        mappedProfile.user_id = userId;

        // Check if profile already exists for this user
        const existingProfile = await this.peopleProfileRepository.findOne({
          where: { linkedin_num_id: mappedProfile.linkedin_num_id, user_id: userId },
        });

        if (existingProfile) {
          // Update existing profile
          Object.assign(existingProfile, mappedProfile);
          const updated = await this.peopleProfileRepository.save(existingProfile);
          savedProfiles.push(updated);
          this.logger.log(`Updated existing profile: ${mappedProfile.linkedin_num_id}`);
        } else {
          // Create new profile
          const newProfile = this.peopleProfileRepository.create(mappedProfile);
          const saved = await this.peopleProfileRepository.save(newProfile);
          if (Array.isArray(saved)) {
            savedProfiles.push(...saved);
          } else {
            savedProfiles.push(saved);
          }
          this.logger.log(`Saved new profile: ${mappedProfile.linkedin_num_id}`);
        }
      } catch (error) {
        this.logger.error(`Error saving profile ${profileData?.linkedin_num_id || profileData?.id || 'unknown'}: ${error.message}`);
        this.logger.error(`Profile data: ${JSON.stringify(profileData, null, 2)}`);
      }
    }

    return savedProfiles;
  }

  /**
   * Map BrightData profile response to database entity format
   */
  private mapProfileData(profileData: any): Partial<PeopleProfile> {
    return {
      linkedin_num_id: profileData.linkedin_num_id?.toString() || profileData.id?.toString() || null,
      url: profileData.url || profileData.input_url,
      name: profileData.name,
      country_code: profileData.country_code,
      city: profileData.city || profileData.location,
      about: profileData.about,
      followers: parseInt(profileData.followers) || undefined,
      connections: parseInt(profileData.connections) || undefined,
      position: profileData.position || profileData.current_company?.title,
      experience: profileData.experience || [],
      current_company: profileData.current_company,
      current_company_name: profileData.current_company_name || profileData.current_company?.name,
      current_company_company_id: profileData.current_company_company_id || profileData.current_company?.company_id,
      posts: profileData.posts,
      activity: profileData.activity || [],
      education: profileData.education || [],
      educations_details: profileData.educations_details,
      courses: profileData.courses,
      certifications: profileData.certifications,
      honors_and_awards: profileData.honors_and_awards,
      volunteer_experience: profileData.volunteer_experience,
      organizations: profileData.organizations,
      recommendations_count: parseInt(profileData.recommendations_count) || undefined,
      recommendations: profileData.recommendations,
      languages: profileData.languages,
      projects: profileData.projects,
      patents: profileData.patents,
      publications: profileData.publications,
      avatar: profileData.avatar,
      default_avatar: profileData.default_avatar || false,
      banner_image: profileData.banner_image,
      similar_profiles: profileData.similar_profiles || [],
      people_also_viewed: profileData.people_also_viewed,
      memorialized_account: profileData.memorialized_account || false,
      input_url: profileData.input_url || profileData.url,
      linkedin_id: profileData.linkedin_id || profileData.id,
      bio_links: profileData.bio_links || [],
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      timestamp: profileData.timestamp || new Date().toISOString(),
    };
  }

  async getAllProfiles(userId: string) {
    return this.peopleProfileRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getProfileById(id: string, userId: string) {
    return this.peopleProfileRepository.findOne({ where: { id, user_id: userId } });
  }

  async getProfileByLinkedInId(linkedinId: string, userId: string) {
    return this.peopleProfileRepository.findOne({
      where: { linkedin_num_id: linkedinId, user_id: userId },
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
      // First check if the snapshot is ready
      const progress = await this.brightdataService.monitorProgress(snapshotId);

      if (progress.status !== 'completed' && progress.status !== 'ready') {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: progress.status,
          message: `Snapshot is not ready yet. Current status: ${progress.status}`,
        };
      }

      // Download the snapshot data
      const snapshotData = await this.brightdataService.downloadSnapshot(snapshotId);

      // Extract profiles from the downloaded data
      const profilesData = this.extractProfilesFromResponse(snapshotData);

      // Save profiles to database
      const savedProfiles = await this.saveProfilesToDatabase(profilesData, userId);

      this.logger.log(`Successfully processed ${savedProfiles.length} profiles from snapshot ${snapshotId}`);

      return {
        success: true,
        snapshot_id: snapshotId,
        status: progress.status,
        message: `Successfully retrieved ${profilesData.length} profiles`,
        data: profilesData,
        saved_count: savedProfiles.length,
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot data ${snapshotId}: ${error.message}`);
      throw error;
    }
  }
}
