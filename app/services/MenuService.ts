import BaseService from './BaseService'
import type { MenuDto, UpsertMenuDto } from '~/types/homepagetemplate/Menu'

const resource = '/api/v1/admin/menu'

class MenuService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getMenus(templateId: string): Promise<MenuDto[]> {
    return await this.baseService.get<MenuDto[]>(`${resource}/list`, { TemplateId: templateId })
  }

  async upsertMenu(payload: UpsertMenuDto): Promise<MenuDto> {
    return await this.baseService.post<MenuDto>(`${resource}/upsert`, payload)
  }

  async deleteMenu(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/delete/${id}`)
  }
}

export default new MenuService()