import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkedinRequest, RequestStatus, RequestType } from '../entities';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(LinkedinRequest)
    private readonly linkedinRequestRepository: Repository<LinkedinRequest>,
  ) {}

  async createRequest(
    requestType: RequestType,
    requestPayload: Record<string, any>,
  ): Promise<LinkedinRequest> {
    const request = this.linkedinRequestRepository.create({
      requestType,
      requestPayload,
      status: RequestStatus.PENDING,
    });

    return this.linkedinRequestRepository.save(request);
  }

  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    responseData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<LinkedinRequest | null> {
    const updateData: Partial<LinkedinRequest> = { status };

    if (responseData) {
      updateData.responseData = responseData;
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    if (status === RequestStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    if (status === RequestStatus.FAILED) {
      updateData.failedAt = new Date();
    }

    await this.linkedinRequestRepository.update(id, updateData);
    return this.linkedinRequestRepository.findOne({ where: { id } });
  }

  async findRequestById(id: string): Promise<LinkedinRequest | null> {
    return this.linkedinRequestRepository.findOne({ where: { id } });
  }

  async findRequestsByStatus(status: RequestStatus): Promise<LinkedinRequest[]> {
    return this.linkedinRequestRepository.find({ where: { status } });
  }

  async findRequestsByType(requestType: RequestType): Promise<LinkedinRequest[]> {
    return this.linkedinRequestRepository.find({ where: { requestType } });
  }
}