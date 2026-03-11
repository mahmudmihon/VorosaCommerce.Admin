import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { SpecificationAttributeDto, UpsertSpecificationAttributeDto } from '~/types/catalog/SpecificationAttribute'

const resource = '/api/v1/admin/specificationattribute'

class SpecificationAttributeService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getSpecificationAttributes(params: Record<string, unknown>): Promise<PagedList<SpecificationAttributeDto>> {
    return await this.baseService.get<PagedList<SpecificationAttributeDto>>(`${resource}/list`, params)
  }

  async getSpecificationAttributeById(id: string): Promise<SpecificationAttributeDto> {
    return await this.baseService.get<SpecificationAttributeDto>(`${resource}/${id}`)
  }

  async upsertSpecificationAttribute(command: UpsertSpecificationAttributeDto): Promise<SpecificationAttributeDto> {
    return await this.baseService.post<SpecificationAttributeDto>(`${resource}/upsert`, command)
  }

  async deleteSpecificationAttribute(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new SpecificationAttributeService()