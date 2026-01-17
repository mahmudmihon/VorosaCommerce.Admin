import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductDto, UpsertProductInfoDto, UpsertProductSEOInfoDto } from '~/types/catalog/Product'

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

  async upsertProduct(command: UpsertProductInfoDto): Promise<ProductDto> {
    const formData = new FormData()

    if (command.Id) formData.append('Id', command.Id)
    formData.append('ProductType', String(command.ProductType))
    formData.append('Name', command.Name)
    formData.append('Sku', command.Sku)
    if (command.ShortDescription) formData.append('ShortDescription', command.ShortDescription)
    if (command.FullDescription) formData.append('FullDescription', command.FullDescription)
    formData.append('Price', String(command.Price))
    formData.append('OldPrice', String(command.OldPrice))
    if (command.BrandId) formData.append('BrandId', command.BrandId)
    formData.append('DisplayOrder', String(command.DisplayOrder))
    formData.append('Published', String(command.Published))

    for (const [index, picture] of (command.Pictures || []).entries()) {
      if (picture.PictureId) formData.append(`Pictures[${index}].PictureId`, picture.PictureId)
      if (picture.File) formData.append(`Pictures[${index}].File`, picture.File)
    }

    return await this.baseService.post<ProductDto>(`${resource}/upsert`, formData)
  }

  async updateProductSeo(command: UpsertProductSEOInfoDto): Promise<ProductDto> {
    return await this.baseService.put<ProductDto>(`${resource}/seo`, command)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }
}

export default new ProductService()