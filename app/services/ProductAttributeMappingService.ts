import BaseService from './BaseService'
import type { ProductAttributeCombinationDto, ProductAttributeMappingDto, UpdateProductAttributeCombinationDto, UpsertProductAttributeMappingDto, UpsertProductAttributeValueDto } from '~/types/catalog/ProductAttribute'

const resource = '/api/v1/admin/ProductAttributeMapping'

class ProductAttributeMappingService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getProductAttributeMappings(params: Record<string, unknown>): Promise<ProductAttributeMappingDto[]> {
    return await this.baseService.get<ProductAttributeMappingDto[]>(resource, params)
  }

  async getCombinations(params: Record<string, unknown>): Promise<ProductAttributeCombinationDto[]> {
    return await this.baseService.get<ProductAttributeCombinationDto[]>(`${resource}/combinations`, params)
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

  async deleteProductAttributeValue(mappingId: string, valueId: string, productId: string): Promise<void> {
    await this.baseService.delete(`${resource}/${mappingId}/values/${valueId}`, {
      ProductId: productId,
      MappingId: mappingId,
      ValueId: valueId
    })
  }

  async deleteProductAttributeMapping(mappingId: string, productId: string): Promise<void> {
    await this.baseService.delete(`${resource}/${mappingId}`, {
      ProductId: productId,
      MappingId: mappingId
    })
  }

  async generateCombinations(payload: { ProductId: string }): Promise<void> {
    await this.baseService.post(`${resource}/generate-combinations`, payload)
  }

  async clearCombinations(payload: { ProductId: string }): Promise<void> {
    await this.baseService.delete(`${resource}/clear-combinations`, payload)
  }

  async updateCombination(payload: UpdateProductAttributeCombinationDto): Promise<void> {
    await this.baseService.put(`${resource}/update-combination`, payload)
  }

  async deleteCombination(payload: { ProductId: string, Id: string }): Promise<void> {
    await this.baseService.delete(`${resource}/delete-combination`, payload)
  }
}

export default new ProductAttributeMappingService()
