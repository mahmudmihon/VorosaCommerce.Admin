import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductTagDto, UpsertProductTagDto } from '~/types/catalog/ProductTag'

const resource = '/api/v1/admin/producttag'

class ProductTagService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getProductTags(params: Record<string, unknown>): Promise<PagedList<ProductTagDto>> {
    return await this.baseService.get<PagedList<ProductTagDto>>(`${resource}/list`, params)
  }

  async getProductTagById(id: string): Promise<ProductTagDto> {
    return await this.baseService.get<ProductTagDto>(`${resource}/${id}`)
  }

  async upsertProductTag(command: UpsertProductTagDto): Promise<ProductTagDto> {
    return await this.baseService.post<ProductTagDto>(`${resource}/upsert`, command)
  }

  async deleteProductTag(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductTagService()
