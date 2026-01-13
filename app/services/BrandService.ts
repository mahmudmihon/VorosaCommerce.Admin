import BaseService from './BaseService';
import type { PagedList } from '~/types/common/PagedList';
import type { BrandDto, UpsertBrandInfoDto, UpsertBrandSEOInfoDto } from '~/types/catalog/Brand';

const resource = '/api/v1/admin/brand';

class BrandService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getBrands(params: Record<string, unknown>): Promise<PagedList<BrandDto>> {
    return await this.baseService.get<PagedList<BrandDto>>(resource, params);
  }

  async getBrandById(id: string): Promise<BrandDto> {
    return await this.baseService.get<BrandDto>(`${resource}/${id}`);
  }

  async deleteBrand(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`);
  }

  async upsertBrand(command: UpsertBrandInfoDto): Promise<BrandDto> {
    const formData = new FormData();
    if (command.Id) formData.append('Id', command.Id);
    formData.append('Name', command.Name);
    if (command.Description) formData.append('Description', command.Description);
    formData.append('Published', String(command.Published));
    formData.append('DisplayOrder', String(command.DisplayOrder));

    if (command.Picture.PictureId) formData.append('Picture.PictureId', command.Picture.PictureId);
    if (command.Picture.File) formData.append('Picture.File', command.Picture.File);

    if (command.Icon.PictureId) formData.append('Icon.PictureId', command.Icon.PictureId);
    if (command.Icon.File) formData.append('Icon.File', command.Icon.File);

    return await this.baseService.post<BrandDto>(`${resource}/upsert`, formData);
  }

  async updateBrandSeo(command: UpsertBrandSEOInfoDto): Promise<BrandDto> {
    return await this.baseService.put<BrandDto>(`${resource}/seo`, command);
  }
}

export default new BrandService();
