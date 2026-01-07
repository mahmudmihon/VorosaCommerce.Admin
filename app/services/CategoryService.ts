import BaseService from './BaseService';
import type { PagedList } from '~/types/common/PagedList';
import type { CategoryDto } from '~/types/catalog/Category';

const resource = '/api/v1/admin/category';

class CategoryService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getCategories(params: any): Promise<PagedList<CategoryDto>> {
    return await this.baseService.get<PagedList<CategoryDto>>(resource, params);
  }
}

export default new CategoryService();
