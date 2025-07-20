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

  async discoverProfiles(peopleNameSearchDto: CreatePeopleProfileDiscoverDto) {
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
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. Profile discovery started.`);

        return {
          success: true,
          message: `Profile discovery started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          search_criteria: peopleNameSearchDto.names,
          instructions: {
            check_status: `GET /linkedin/people-profile/discover/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/people-profile/discover/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // Handle direct response (if not async)
      if (Array.isArray(brightDataResponse)) {
        this.logger.log(`Received direct response with ${brightDataResponse.length} profiles`);
        
        // Save profiles to database with search metadata
        const savedProfiles = await this.saveProfilesToDatabase(brightDataResponse, peopleNameSearchDto.names);
        
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

  private async saveProfilesToDatabase(profiles: any[], searchNames: any[]): Promise<PeopleProfileDiscover[]> {
    const savedProfiles: PeopleProfileDiscover[] = [];

    for (const profileData of profiles) {
      try {
        // Find matching search criteria (basic matching by first/last name)
        const matchingSearch = searchNames.find(search => 
          profileData.first_name?.toLowerCase().includes(search.first_name?.toLowerCase()) &&
          profileData.last_name?.toLowerCase().includes(search.last_name?.toLowerCase())
        );

        // Check if profile already exists
        const existingProfile = await this.peopleProfileDiscoverRepository.findOne({
          where: { linkedin_num_id: profileData.linkedin_num_id },
        });

        if (existingProfile) {
          // Update existing profile
          Object.assign(existingProfile, {
            ...profileData,
            search_first_name: matchingSearch?.first_name,
            search_last_name: matchingSearch?.last_name,
          });
          const updated = await this.peopleProfileDiscoverRepository.save(existingProfile);
          if (Array.isArray(updated)) {
            savedProfiles.push(...updated);
          } else {
            savedProfiles.push(updated);
          }
          this.logger.log(`Updated existing discovered profile: ${profileData.linkedin_num_id}`);
        } else {
          // Create new profile
          const newProfile = this.peopleProfileDiscoverRepository.create({
            ...profileData,
            search_first_name: matchingSearch?.first_name,
            search_last_name: matchingSearch?.last_name,
          });
          const saved = await this.peopleProfileDiscoverRepository.save(newProfile);
          if (Array.isArray(saved)) {
            savedProfiles.push(...saved);
          } else {
            savedProfiles.push(saved);
          }
          this.logger.log(`Saved new discovered profile: ${profileData.linkedin_num_id}`);
        }
      } catch (error) {
        this.logger.error(`Error saving discovered profile ${profileData.linkedin_num_id}: ${error.message}`);
      }
    }

    return savedProfiles;
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

  async getSnapshotData(snapshotId: string) {
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
        const savedProfiles = await this.saveProfilesToDatabase(profilesData, []);
        
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

  async getAllDiscoveredProfiles() {
    return this.peopleProfileDiscoverRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getDiscoveredProfileById(id: string) {
    return this.peopleProfileDiscoverRepository.findOne({ where: { id } });
  }

  async getDiscoveredProfileByLinkedInId(linkedinId: string) {
    return this.peopleProfileDiscoverRepository.findOne({
      where: { linkedin_id: linkedinId },
    });
  }

  async searchByName(firstName: string, lastName: string) {
    return this.peopleProfileDiscoverRepository.find({
      where: [
        { first_name: firstName, last_name: lastName },
        { search_first_name: firstName, search_last_name: lastName }
      ],
      order: { created_at: 'DESC' }
    });
  }

  create(createPeopleProfileDiscoverDto: CreatePeopleProfileDiscoverDto) {
    return this.discoverProfiles(createPeopleProfileDiscoverDto);
  }

  findAll() {
    return this.getAllDiscoveredProfiles();
  }

  findOne(id: number) {
    return this.getDiscoveredProfileById(id.toString());
  }

  update(id: number, updatePeopleProfileDiscoverDto: UpdatePeopleProfileDiscoverDto) {
    return `This action updates a #${id} peopleProfileDiscover`;
  }

  remove(id: number) {
    return `This action removes a #${id} peopleProfileDiscover`;
  }
}
