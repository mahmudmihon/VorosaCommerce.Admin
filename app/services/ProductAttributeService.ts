import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductAttributeDto, UpsertProductAttributeDto } from '~/types/catalog/ProductAttribute'

const resource = '/api/v1/admin/productattribute'

class ProductAttributeService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getProductAttributes(params: Record<string, unknown>): Promise<PagedList<ProductAttributeDto>> {
    return await this.baseService.get<PagedList<ProductAttributeDto>>(`${resource}/list`, params)
  }

  async getProductAttributeById(id: string): Promise<ProductAttributeDto> {
    return await this.baseService.get<ProductAttributeDto>(`${resource}/${id}`)
  }

  async upsertProductAttribute(command: UpsertProductAttributeDto): Promise<ProductAttributeDto> {
    return await this.baseService.post<ProductAttributeDto>(`${resource}/upsert`, command)
  }

  async deleteProductAttribute(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductAttributeService()
