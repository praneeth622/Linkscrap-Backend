import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BrightdataService {
  private readonly logger = new Logger(BrightdataService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async triggerDataset(datasetId: string, payload: any[], type?: string, discoverBy?: string): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true`;

      // Add optional parameters for post discovery by URL
      if (type) {
        url += `&type=${type}`;
      }
      if (discoverBy) {
        url += `&discover_by=${discoverBy}`;
      }

      this.logger.log(`Triggering BrightData dataset: ${datasetId} with ${payload.length} items`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to fetch data from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async triggerDiscoverByName(datasetId: string, payload: any[]): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true&type=discover_new&discover_by=name`;

      this.logger.log(`Triggering BrightData discover by name dataset: ${datasetId} with ${payload.length} names`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData discover response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for discover by name dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to discover profiles by name from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async triggerDiscoverByKeyword(datasetId: string, payload: any[]): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true&type=discover_new&discover_by=keyword`;

      this.logger.log(`Triggering BrightData discover by keyword dataset: ${datasetId} with ${payload.length} search queries`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData discover by keyword response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for discover by keyword dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to discover job listings by keyword from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async triggerDiscoverByUrl(datasetId: string, payload: any[]): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true&type=discover_new&discover_by=url`;

      this.logger.log(`Triggering BrightData discover by URL dataset: ${datasetId} with ${payload.length} URLs`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData discover by URL response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for discover by URL dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to discover job listings by URL from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async triggerDiscoverByCompanyUrl(datasetId: string, payload: any[]): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');

      if (!apiKey) {
        throw new HttpException(
          'BrightData API key is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!baseUrl) {
        throw new HttpException(
          'BrightData base URL is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true&type=discover_new&discover_by=company_url`;

      this.logger.log(`Triggering BrightData discover by company URL for dataset: ${datasetId} with ${payload.length} company URLs`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData discover by company URL response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for discover by company URL dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to discover posts by company URL from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async monitorProgress(snapshotId: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!apiKey) {
        throw new HttpException(
          'BrightData API key is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`;

      this.logger.debug(`Monitoring progress for snapshot: ${snapshotId}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      );

      this.logger.debug(`Progress response: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Error monitoring progress for snapshot ${snapshotId}: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      throw new HttpException(
        `Failed to monitor progress: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async downloadSnapshot(snapshotId: string, format: string = 'json'): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!apiKey) {
        throw new HttpException(
          'BrightData API key is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=${format}`;

      this.logger.log(`Downloading snapshot: ${snapshotId}`);
      this.logger.debug(`Download URL: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      );

      this.logger.log(`Snapshot downloaded successfully: ${snapshotId}`);
      this.logger.debug(`Downloaded data type: ${typeof response.data}`);
      this.logger.debug(`Downloaded data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Error downloading snapshot ${snapshotId}: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      throw new HttpException(
        `Failed to download snapshot: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async triggerDiscoverByProfileUrl(datasetId: string, payload: any[]): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');

      if (!apiKey) {
        throw new HttpException(
          'BrightData API key is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!baseUrl) {
        throw new HttpException(
          'BrightData base URL is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl}?dataset_id=${datasetId}&include_errors=true&type=discover_new&discover_by=profile_url`;

      this.logger.log(`Triggering BrightData discover by profile URL for dataset: ${datasetId} with ${payload.length} profile URLs`);
      this.logger.debug(`Request URL: ${url}`);
      this.logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`BrightData discover by profile URL response received for dataset: ${datasetId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for discover by profile URL dataset ${datasetId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      if (error.request) {
        this.logger.error(`Request failed: ${error.request}`);
      }

      throw new HttpException(
        `Failed to discover posts by profile URL from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getSnapshotStatus(snapshotId: string): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl.replace('/trigger', '')}/snapshot/${snapshotId}`;

      this.logger.log(`Getting snapshot status for: ${snapshotId}`);
      this.logger.debug(`Request URL: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      );

      this.logger.log(`Snapshot status received for: ${snapshotId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for snapshot status ${snapshotId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      throw new HttpException(
        `Failed to get snapshot status from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getSnapshotData(snapshotId: string): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('BRIGHTDATA_BASE_URL');
      const apiKey = this.configService.get<string>('BRIGHTDATA_API_KEY');

      if (!baseUrl || !apiKey) {
        throw new HttpException(
          'BrightData configuration is missing',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const url = `${baseUrl.replace('/trigger', '')}/snapshot/${snapshotId}/data`;

      this.logger.log(`Getting snapshot data for: ${snapshotId}`);
      this.logger.debug(`Request URL: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }),
      );

      this.logger.log(`Snapshot data received for: ${snapshotId}`);
      this.logger.debug(`Response status: ${response.status}`);
      this.logger.debug(`Response data type: ${typeof response.data}`);

      return response.data;
    } catch (error) {
      this.logger.error(`BrightData API error for snapshot data ${snapshotId}:`);
      this.logger.error(`Error message: ${error.message}`);

      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }

      throw new HttpException(
        `Failed to get snapshot data from BrightData: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}