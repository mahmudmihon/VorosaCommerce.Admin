import BaseService from './BaseService';
import type { HomepageTemplateDto, UpsertHomepageTemplateDto } from '~/types/homepagetemplate/HomepageTemplate';

const resource = 'api/v1/admin/homepagetemplate';

class HomepageTemplateService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getHomepageTemplates(): Promise<HomepageTemplateDto[]> {
    return await this.baseService.get<HomepageTemplateDto[]>(`${resource}/list`);
  }

  async getHomepageTemplateById(id: string): Promise<HomepageTemplateDto> {
    return await this.baseService.get<HomepageTemplateDto>(`${resource}/${id}`);
  }

  async upsertHomepageTemplate(payload: UpsertHomepageTemplateDto): Promise<HomepageTemplateDto> {
    return await this.baseService.post<HomepageTemplateDto>(`${resource}/upsert`, payload);
  }

  async deleteHomepageTemplate(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`);
  }
}

export default new HomepageTemplateService();
