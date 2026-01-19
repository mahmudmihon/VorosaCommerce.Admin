import BaseService from './BaseService'
import type { ProductAttributeMappingDto, UpsertProductAttributeMappingDto } from '~/types/catalog/ProductAttribute'

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
}

export default new ProductAttributeMappingService()