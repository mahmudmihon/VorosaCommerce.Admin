import BaseService from './BaseService'
import type { CampaignInfoDto, UpsertCampaignInfoDto } from '~/types/marketing/Campaign'

const resource = '/api/v1/admin/campaign'

class CampaignService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getCampaignById(id: string): Promise<CampaignInfoDto> {
    return await this.baseService.get<CampaignInfoDto>(`${resource}/${id}`)
  }

  async upsertCampaignInfo(payload: UpsertCampaignInfoDto): Promise<CampaignInfoDto> {
    return await this.baseService.post<CampaignInfoDto>(`${resource}/upsert-info`, payload)
  }
}

export default new CampaignService()