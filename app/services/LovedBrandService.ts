import BaseService from './BaseService'
import type { LovedBrandDto, UpsertLovedBrandDto } from '~/types/homepagetemplate/LovedBrand'

const resource = '/api/v1/admin/lovedbrand'

class LovedBrandService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getLovedBrands(templateId: string): Promise<LovedBrandDto[]> {
    return await this.baseService.get<LovedBrandDto[]>(`${resource}/list?templateId=${templateId}`)
  }

  async upsertLovedBrand(command: UpsertLovedBrandDto): Promise<LovedBrandDto> {
    const formData = new FormData()
    if (command.Id) formData.append('Id', command.Id)
    formData.append('TemplateId', command.TemplateId)
    formData.append('Name', command.Name)
    formData.append('Url', command.Url)
    formData.append('DisplayOrder', String(command.DisplayOrder))
    if (command.Logo) formData.append('Logo', command.Logo)
    return await this.baseService.post<LovedBrandDto>(`${resource}/upsert`, formData)
  }

  async deleteLovedBrand(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new LovedBrandService()
