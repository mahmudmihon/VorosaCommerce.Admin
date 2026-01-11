import BaseService from './BaseService';
import type { PagedList } from '~/types/common/PagedList';
import type { CategoryDto, UpsertCategoryInfoDto, UpsertCategorySEOInfoDto } from '~/types/catalog/Category';

const resource = '/api/v1/admin/category';

class CategoryService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getCategories(params: any): Promise<PagedList<CategoryDto>> {
    return await this.baseService.get<PagedList<CategoryDto>>(resource, params);
  }

  async getCategoryById(id: string): Promise<CategoryDto> {
    return await this.baseService.get<CategoryDto>(`${resource}/${id}`);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.baseService.delete<void>(`${resource}/${id}`);
  }

  async upsertCategory(command: UpsertCategoryInfoDto): Promise<CategoryDto> {
    const formData = new FormData();
    if (command.Id) formData.append('Id', command.Id);
    formData.append('Name', command.Name);
    if (command.Description) formData.append('Description', command.Description);
    if (command.ParentCategoryId) formData.append('ParentCategoryId', command.ParentCategoryId);
    formData.append('IncludeInMenu', String(command.IncludeInMenu));
    formData.append('ShowOnHomePage', String(command.ShowOnHomePage));
    formData.append('Published', String(command.Published));
    formData.append('DisplayOrder', String(command.DisplayOrder));

    // Picture
    if (command.Picture.PictureId) formData.append('Picture.PictureId', command.Picture.PictureId);
    if (command.Picture.File) formData.append('Picture.File', command.Picture.File);

    // Icon
    if (command.Icon.PictureId) formData.append('Icon.PictureId', command.Icon.PictureId);
    if (command.Icon.File) formData.append('Icon.File', command.Icon.File);

    return await this.baseService.post<CategoryDto>(`${resource}/upsert`, formData);
  }

  async updateCategorySeo(command: UpsertCategorySEOInfoDto): Promise<CategoryDto> {
    return await this.baseService.put<CategoryDto>(`${resource}/seo`, command);
  }
}

export default new CategoryService();
