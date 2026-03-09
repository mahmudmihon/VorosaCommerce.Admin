import BaseService from './BaseService'
import type { HomepageProductDto, HomepageProductType, MapHomepageProductsDto, UpsertHomepageProductDto } from '~/types/homepagetemplate/HomepageProduct'

const resource = '/api/v1/admin/homepageproduct'

class HomepageProductService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getHomepageProducts(templateId: string, productType: HomepageProductType): Promise<HomepageProductDto[]> {
    return await this.baseService.get<HomepageProductDto[]>(`${resource}/list`, {
      TemplateId: templateId,
      ProductType: productType
    })
  }

  async upsertHomepageProduct(payload: UpsertHomepageProductDto): Promise<HomepageProductDto> {
    return await this.baseService.post<HomepageProductDto>(`${resource}/upsert`, payload)
  }

  async mapHomepageProducts(payload: MapHomepageProductsDto): Promise<void> {
    await this.baseService.post(`${resource}/map`, payload)
  }
}

export default new HomepageProductService()