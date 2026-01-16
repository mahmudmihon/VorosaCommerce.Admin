import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductDto } from '~/types/catalog/Product'

const resource = '/api/v1/admin/product'

class ProductService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getProducts(params: Record<string, unknown>): Promise<PagedList<ProductDto>> {
    return await this.baseService.get<PagedList<ProductDto>>(`${resource}/list`, params)
  }

  async getProductById(id: string): Promise<ProductDto> {
    return await this.baseService.get<ProductDto>(`${resource}/${id}`)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductService()