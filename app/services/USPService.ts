import BaseService from './BaseService'
import type { UpsertUSPDto, USPDto } from '~/types/homepagetemplate/USP'

const resource = '/api/v1/admin/usp'

class USPService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getUsps(templateId: string): Promise<USPDto[]> {
    return await this.baseService.get<USPDto[]>(`${resource}/list?templateId=${templateId}`)
  }

  async upsertUsp(command: UpsertUSPDto): Promise<USPDto> {
    const formData = new FormData()
    if (command.Id) formData.append('Id', command.Id)
    formData.append('TemplateId', command.TemplateId)
    formData.append('Title', command.Title)
    formData.append('Description', command.Description)
    formData.append('DisplayOrder', String(command.DisplayOrder))
    if (command.Image) formData.append('Image', command.Image)
    return await this.baseService.post<USPDto>(`${resource}/upsert`, formData)
  }

  async deleteUsp(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new USPService()