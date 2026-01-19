import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductCategoryDto, ProductDto, UpsertProductCategoryDto, UpsertProductInfoDto, UpsertProductInventoryDto, UpsertProductSEOInfoDto } from '~/types/catalog/Product'

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

  async upsertProduct(payload: UpsertProductInfoDto): Promise<ProductDto> {
    return await this.baseService.post<ProductDto>(`${resource}/general`, payload)
  }

  async updateProductSeo(payload: UpsertProductSEOInfoDto): Promise<ProductDto> {
    return await this.baseService.put<ProductDto>(`${resource}/seo`, payload)
  }

  async updateProductInventory(payload: UpsertProductInventoryDto): Promise<ProductDto> {
    return await this.baseService.put<ProductDto>(`${resource}/inventory`, payload)
  }

  async getProductCategories(id: string): Promise<ProductCategoryDto[]> {
    return await this.baseService.get<ProductCategoryDto[]>(`${resource}/${id}/categories`)
  }

  async addProductCategory(id: string, payload: UpsertProductCategoryDto): Promise<void> {
    await this.baseService.post(`${resource}/${id}/categories`, payload)
  }

  async deleteProductCategory(id: string, categoryId: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}/categories/${categoryId}`)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductService()
