import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { CreatePeopleProfileDiscoverDto } from './dto/create-people-profile-discover.dto';
import { UpdatePeopleProfileDiscoverDto } from './dto/update-people-profile-discover.dto';
import { PeopleProfileDiscover } from './entities/people-profile-discover.entity';

@Injectable()
export class PeopleProfileDiscoverService {
  private readonly logger = new Logger(PeopleProfileDiscoverService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(PeopleProfileDiscover)
    private readonly peopleProfileDiscoverRepository: Repository<PeopleProfileDiscover>,
  ) {}

  async discoverProfiles(peopleNameSearchDto: CreatePeopleProfileDiscoverDto, userId: string) {
    try {
      const datasetId = this.configService.get<string>('PEOPLE_PROFILE_DISCOVER_DATASET_ID');

      if (!datasetId) {
        throw new Error('People Profile Discover dataset ID is not configured');
      }

      this.logger.log(`Discovering profiles for ${peopleNameSearchDto.names.length} names`);

      // Call BrightData API to trigger discover by name
      const brightDataResponse = await this.brightdataService.triggerDiscoverByName(
        datasetId,
        peopleNameSearchDto.names,
      );

      this.logger.log(`BrightData response structure: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}, waiting for profile discovery to complete...`);

        // Wait for data collection to complete and get the actual profile data
        const profilesData = await this.waitForDataAndRetrieve(brightDataResponse.snapshot_id);

        // Save profiles to database with search metadata
        const savedProfiles = await this.saveProfilesToDatabase(profilesData, peopleNameSearchDto.names, userId);

        this.logger.log(`Successfully processed ${savedProfiles.length} discovered profiles`);

        return {
          success: true,
          message: `Successfully discovered ${profilesData.length} profiles`,
          data: profilesData,
          saved_count: savedProfiles.length,
          search_criteria: peopleNameSearchDto.names,
          snapshot_id: brightDataResponse.snapshot_id,
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} profiles`);

        // Save profiles to database with search metadata
        const savedProfiles = await this.saveProfilesToDatabase(brightDataResponse, peopleNameSearchDto.names, userId);

        return {
          success: true,
          message: `Successfully discovered ${savedProfiles.length} profiles`,
          data: brightDataResponse,
          saved_count: savedProfiles.length,
          search_criteria: peopleNameSearchDto.names,
        };
      }

      // Unexpected response format
      this.logger.warn(`Unexpected response format from BrightData: ${JSON.stringify(brightDataResponse)}`);
      return {
        success: false,
        message: 'Unexpected response format from BrightData',
        response: brightDataResponse
      };

    } catch (error) {
      this.logger.error(`Error discovering profiles: ${error.message}`);
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

  private async saveProfilesToDatabase(profiles: any[], searchNames: any[], userId: string): Promise<PeopleProfileDiscover[]> {
    const savedProfiles: PeopleProfileDiscover[] = [];

    if (!Array.isArray(profiles)) {
      this.logger.error('Profiles parameter is not an array');
      return savedProfiles;
    }

    if (profiles.length === 0) {
      this.logger.warn('No discovered profiles to save to database');
      return savedProfiles;
    }

    this.logger.log(`Attempting to save ${profiles.length} discovered profiles to database`);

    for (const profileData of profiles) {
      try {
        if (!profileData || typeof profileData !== 'object') {
          this.logger.warn('Skipping invalid profile data:', profileData);
          continue;
        }

        // Map BrightData response to database entity format
        const mappedProfile = this.mapDiscoveredProfileData(profileData, searchNames);

        // Add user_id to the mapped profile
        mappedProfile.user_id = userId;

        // Check if profile already exists for this user
        const existingProfile = await this.peopleProfileDiscoverRepository.findOne({
          where: { linkedin_num_id: mappedProfile.linkedin_num_id, user_id: userId },
        });

        if (existingProfile) {
          // Update existing profile
          Object.assign(existingProfile, mappedProfile);
          const updated = await this.peopleProfileDiscoverRepository.save(existingProfile);
          savedProfiles.push(updated);
          this.logger.log(`Updated existing discovered profile: ${mappedProfile.linkedin_num_id}`);
        } else {
          // Create new profile
          const newProfile = this.peopleProfileDiscoverRepository.create(mappedProfile);
          const saved = await this.peopleProfileDiscoverRepository.save(newProfile);
          if (Array.isArray(saved)) {
            savedProfiles.push(...saved);
          } else {
            savedProfiles.push(saved);
          }
          this.logger.log(`Saved new discovered profile: ${mappedProfile.linkedin_num_id}`);
        }
      } catch (error) {
        this.logger.error(`Error saving discovered profile ${profileData?.linkedin_num_id || profileData?.id || 'unknown'}: ${error.message}`);
        this.logger.error(`Profile data: ${JSON.stringify(profileData, null, 2)}`);
      }
    }

    return savedProfiles;
  }

  /**
   * Map BrightData discovered profile response to database entity format
   */
  private mapDiscoveredProfileData(profileData: any, searchNames: any[]): Partial<PeopleProfileDiscover> {
    // Find matching search criteria (basic matching by first/last name)
    const matchingSearch = searchNames.find(search =>
      profileData.first_name?.toLowerCase().includes(search.first_name?.toLowerCase()) &&
      profileData.last_name?.toLowerCase().includes(search.last_name?.toLowerCase())
    );

    return {
      linkedin_num_id: profileData.linkedin_num_id?.toString() || profileData.id?.toString() || null,
      url: profileData.url || profileData.input_url,
      name: profileData.name,
      country_code: profileData.country_code,
      city: profileData.city || profileData.location,
      about: profileData.about,
      followers: parseInt(profileData.followers) || 0,
      connections: parseInt(profileData.connections) || 0,
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
      search_first_name: matchingSearch?.first_name,
      search_last_name: matchingSearch?.last_name,
    };
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      const statusData = await this.brightdataService.monitorProgress(snapshotId);
      const datasetId = this.configService.get<string>('PEOPLE_PROFILE_DISCOVER_DATASET_ID');

      return {
        success: true,
        snapshot_id: snapshotId,
        status: statusData.status,
        dataset_id: datasetId,
        message: `Snapshot status: ${statusData.status}`,
        ...statusData
      };
    } catch (error) {
      this.logger.error(`Error getting snapshot status: ${error.message}`);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string, userId: string) {
    try {
      // First check the status
      const statusData = await this.brightdataService.monitorProgress(snapshotId);
      
      if (statusData.status !== 'completed' && statusData.status !== 'ready') {
        return {
          success: false,
          snapshot_id: snapshotId,
          status: statusData.status,
          message: `Snapshot is not ready yet. Current status: ${statusData.status}`
        };
      }

      // Download the data
      const profilesData = await this.brightdataService.downloadSnapshot(snapshotId);
      
      if (Array.isArray(profilesData)) {
        // Save to database - note: we don't have search criteria here, so we'll save without search metadata
        const savedProfiles = await this.saveProfilesToDatabase(profilesData, [], userId);
        
        return {
          success: true,
          snapshot_id: snapshotId,
          status: 'completed',
          message: `Successfully retrieved ${profilesData.length} discovered profiles`,
          data: profilesData,
          saved_count: savedProfiles.length
        };
      } else {
        return {
          success: true,
          snapshot_id: snapshotId,
          status: 'completed',
          message: 'Snapshot data retrieved but format is unexpected',
          data: profilesData
        };
      }
    } catch (error) {
      this.logger.error(`Error getting snapshot data: ${error.message}`);
      throw error;
    }
  }

  async getAllDiscoveredProfiles(userId: string) {
    return this.peopleProfileDiscoverRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredProfileById(id: string, userId: string) {
    return this.peopleProfileDiscoverRepository.findOne({ where: { id, user_id: userId } });
  }

  async getDiscoveredProfileByLinkedInId(linkedinId: string, userId: string) {
    return this.peopleProfileDiscoverRepository.findOne({
      where: { linkedin_num_id: linkedinId, user_id: userId },
    });
  }

  async searchByName(firstName: string, lastName: string, userId: string) {
    return this.peopleProfileDiscoverRepository.find({
      where: [
        { first_name: firstName, last_name: lastName, user_id: userId },
        { search_first_name: firstName, search_last_name: lastName, user_id: userId }
      ],
      order: { created_at: 'DESC' }
    });
  }

  create(createPeopleProfileDiscoverDto: CreatePeopleProfileDiscoverDto, userId: string) {
    return this.discoverProfiles(createPeopleProfileDiscoverDto, userId);
  }

  findAll(userId: string) {
    return this.getAllDiscoveredProfiles(userId);
  }

  findOne(id: number, userId: string) {
    return this.getDiscoveredProfileById(id.toString(), userId);
  }

  update(id: number, updatePeopleProfileDiscoverDto: UpdatePeopleProfileDiscoverDto, userId: string) {
    return `This action updates a #${id} peopleProfileDiscover`;
  }

  remove(id: number, userId: string) {
    return `This action removes a #${id} peopleProfileDiscover`;
  }
}
