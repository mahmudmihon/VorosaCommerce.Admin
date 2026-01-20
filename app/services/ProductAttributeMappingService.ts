import BaseService from './BaseService'
import type { ProductAttributeMappingDto, UpsertProductAttributeMappingDto, UpsertProductAttributeValueDto } from '~/types/catalog/ProductAttribute'

const resource = '/api/v1/admin/ProductAttributeMapping'

class ProductAttributeMappingService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getProductAttributeMappings(params: Record<string, unknown>): Promise<ProductAttributeMappingDto[]> {
    return await this.baseService.get<ProductAttributeMappingDto[]>(resource, params)
  }

  async addProductAttributeMapping(payload: UpsertProductAttributeMappingDto): Promise<ProductAttributeMappingDto[]> {
    return await this.baseService.post<ProductAttributeMappingDto[]>(resource, payload)
  }

  async addProductAttributeValue(payload: UpsertProductAttributeValueDto): Promise<ProductAttributeMappingDto[]> {
    if (payload.Id) {
      return await this.baseService.put<ProductAttributeMappingDto[]>(`${resource}/${payload.MappingId}/values/${payload.Id}`, payload)
    }
    return await this.baseService.post<ProductAttributeMappingDto[]>(`${resource}/${payload.MappingId}/values`, payload)
  }

  async deleteProductAttributeValue(mappingId: string, id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${mappingId}/values/${id}`)
  }

  async deleteProductAttributeMapping(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductAttributeMappingService()
