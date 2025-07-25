import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrightdataService } from '../../brightdata/brightdata.service';
import { LinkedInPeopleSearch } from './entities/linkedin-people-search.entity';
import { 
  LinkedInPeopleSearchRequestDto, 
  LinkedInPeopleSearchResponseDto,
  PaginatedLinkedInPeopleDto,
  SearchCriteriaDto 
} from './dto/linkedin-people-search-collect.dto';

@Injectable()
export class PeopleSearchCollectService {
  private readonly logger = new Logger(PeopleSearchCollectService.name);

  constructor(
    private readonly brightdataService: BrightdataService,
    private readonly configService: ConfigService,
    @InjectRepository(LinkedInPeopleSearch)
    private readonly peopleSearchRepository: Repository<LinkedInPeopleSearch>,
  ) {}

  async collectPeopleSearch(requestDto: LinkedInPeopleSearchRequestDto, userId: string): Promise<LinkedInPeopleSearchResponseDto> {
    try {
      const datasetId = this.configService.get<string>('LINKEDIN_PEOPLE_SEARCH_COLLECT_DATASET_ID');

      if (!datasetId) {
        throw new Error('LinkedIn People Search Collect dataset ID is not configured');
      }

      // Transform searches for BrightData API according to the provided code structure
      const payload = requestDto.searches.map(search => ({
        url: search.url,
        first_name: search.first_name,
        last_name: search.last_name
      }));

      this.logger.log(`Collecting people search for ${payload.length} searches`);

      // Call BrightData API to trigger data collection
      const brightDataResponse = await this.brightdataService.triggerDataset(
        datasetId,
        payload
      );

      this.logger.log(`BrightData response: ${JSON.stringify(brightDataResponse, null, 2)}`);

      // Check if we got a snapshot_id (async operation)
      if (brightDataResponse?.snapshot_id) {
        this.logger.log(`Received snapshot_id: ${brightDataResponse.snapshot_id}. People search collection started.`);

        return {
          success: true,
          message: `LinkedIn people search collection started successfully. Use the snapshot_id to check status and retrieve data when ready.`,
          snapshot_id: brightDataResponse.snapshot_id,
          status: 'started',
          searches_count: payload.length,
          instructions: {
            check_status: `GET /linkedin/people-search-collect/snapshot/${brightDataResponse.snapshot_id}/status`,
            get_data: `GET /linkedin/people-search-collect/snapshot/${brightDataResponse.snapshot_id}/data`
          }
        };
      }

      // If we got direct data (sync operation), process and save it
      if (Array.isArray(brightDataResponse)) {
        const savedPeople = await this.processBrightDataResponse(brightDataResponse, requestDto.searches, userId);
        
        return {
          success: true,
          message: `Successfully collected and saved ${savedPeople.length} people`,
          searches_count: payload.length
        };
      }

      throw new Error('Unexpected response format from BrightData API');

    } catch (error) {
      this.logger.error(`Error collecting people search: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSnapshotStatus(snapshotId: string) {
    try {
      const status = await this.brightdataService.getSnapshotStatus(snapshotId);
      this.logger.log(`Snapshot ${snapshotId} status: ${JSON.stringify(status, null, 2)}`);
      return status;
    } catch (error) {
      this.logger.error(`Error getting snapshot status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSnapshotData(snapshotId: string, userId: string) {
    try {
      const data = await this.brightdataService.getSnapshotData(snapshotId);
      
      if (Array.isArray(data) && data.length > 0) {
        // Process and save the data
        const savedPeople = await this.processBrightDataResponse(data, [], userId);
        this.logger.log(`Processed and saved ${savedPeople.length} people from snapshot ${snapshotId}`);
        return savedPeople;
      }

      return data;
    } catch (error) {
      this.logger.error(`Error getting snapshot data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processBrightDataResponse(data: any[], searchCriteria: any[], userId: string): Promise<LinkedInPeopleSearch[]> {
    const savedPeople: LinkedInPeopleSearch[] = [];

    for (const [index, personData] of data.entries()) {
      try {
        // Check if person already exists by URL
        const existingPerson = await this.peopleSearchRepository.findOne({
          where: { url: personData.url }
        });

        if (existingPerson) {
          this.logger.log(`Person ${personData.url} already exists, skipping`);
          continue;
        }

        // Get corresponding search criteria
        const searchCriterion = searchCriteria[index] || {};

        // Create new person entity
        const person = this.peopleSearchRepository.create({
          user_id: userId,
          name: personData.name,
          subtitle: personData.subtitle,
          location: personData.location,
          experience: personData.experience,
          education: personData.education,
          avatar: personData.avatar,
          url: personData.url,
          search_first_name: searchCriterion.first_name,
          search_last_name: searchCriterion.last_name,
          search_url: searchCriterion.url,
          input_url: searchCriterion.url || '',
          timestamp: new Date().toISOString()
        });

        const savedPerson = await this.peopleSearchRepository.save(person);
        savedPeople.push(savedPerson);
        this.logger.log(`Saved person: ${savedPerson.name} (${savedPerson.url})`);

      } catch (error) {
        this.logger.error(`Error processing person ${personData.name}: ${error.message}`, error.stack);
      }
    }

    return savedPeople;
  }

  async findAll(page: number = 1, limit: number = 10, userId: string): Promise<PaginatedLinkedInPeopleDto> {
    const [people, total] = await this.peopleSearchRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data: people as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findBySearchCriteria(criteria: SearchCriteriaDto): Promise<LinkedInPeopleSearch[]> {
    const queryBuilder = this.peopleSearchRepository.createQueryBuilder('person');

    if (criteria.first_name) {
      queryBuilder.andWhere('person.search_first_name ILIKE :firstName', { 
        firstName: `%${criteria.first_name}%` 
      });
    }

    if (criteria.last_name) {
      queryBuilder.andWhere('person.search_last_name ILIKE :lastName', { 
        lastName: `%${criteria.last_name}%` 
      });
    }

    if (criteria.location) {
      queryBuilder.andWhere('person.location ILIKE :location', { 
        location: `%${criteria.location}%` 
      });
    }

    if (criteria.experience) {
      queryBuilder.andWhere('person.experience ILIKE :experience', { 
        experience: `%${criteria.experience}%` 
      });
    }

    queryBuilder.orderBy('person.created_at', 'DESC');

    return queryBuilder.getMany();
  }

  async findByLocation(location: string): Promise<LinkedInPeopleSearch[]> {
    return this.peopleSearchRepository.find({
      where: { location },
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<LinkedInPeopleSearch> {
    const person = await this.peopleSearchRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async update(id: string, updateData: Partial<LinkedInPeopleSearch>): Promise<LinkedInPeopleSearch> {
    const person = await this.findOne(id);
    Object.assign(person, updateData);
    return this.peopleSearchRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    await this.peopleSearchRepository.remove(person);
  }
}
