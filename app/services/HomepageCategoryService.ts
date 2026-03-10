import BaseService from './BaseService'
import type { HomepageCategoryDto, MapHomepageCategoriesDto } from '~/types/homepagetemplate/HomepageCategory'

const resource = '/api/v1/admin/homepagecategory'

class HomepageCategoryService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getHomepageCategories(templateId: string): Promise<HomepageCategoryDto[]> {
    return await this.baseService.get<HomepageCategoryDto[]>(`${resource}/list`, {
      TemplateId: templateId
    })
  }

  async mapHomepageCategories(payload: MapHomepageCategoriesDto): Promise<void> {
    await this.baseService.post(`${resource}/map`, payload)
  }

  async updateHomepageCategory(payload: FormData): Promise<HomepageCategoryDto> {
    return await this.baseService.put<HomepageCategoryDto>(`${resource}/update`, payload)
  }

  async deleteHomepageCategory(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new HomepageCategoryService()