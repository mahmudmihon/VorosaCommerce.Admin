import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { PictureDto } from '~/types/common/Picture'
import type { CopyProductDto, ProductCategoryDto, ProductDto, UpsertProductCategoryDto, UpsertProductInfoDto, UpsertProductInventoryDto, UpsertProductSEOInfoDto, UpdateProductPictureDto } from '~/types/catalog/Product'
import type { DeleteProductSpecificationAttributeDto, ProductSpecificationAttributeDto, UpdateProductSpecificationAttributeDto, UpsertProductSpecificationAttributeDto } from '~/types/catalog/ProductSpecificationAttribute'

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

  async getProductPictures(id: string): Promise<PictureDto[]> {
    return await this.baseService.get<PictureDto[]>(`${resource}/picture/list?ProductId=${id}`)
  }

  async addProductPicture(payload: FormData): Promise<void> {
    await this.baseService.post(`${resource}/picture`, payload)
  }

  async updateProductPicture(payload: UpdateProductPictureDto): Promise<void> {
    await this.baseService.put(`${resource}/picture`, payload)
  }

  async deleteProductPicture(id: string, pictureId: string): Promise<void> {
    await this.baseService.delete(`${resource}/picture`, {
      ProductId: id,
      PictureId: pictureId
    })
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
    return await this.baseService.get<ProductCategoryDto[]>(`${resource}/category/list?ProductId=${id}`)
  }

  async addProductCategory(payload: UpsertProductCategoryDto): Promise<void> {
    await this.baseService.post(`${resource}/category`, payload)
  }

  async deleteProductCategory(id: string, categoryId: string): Promise<void> {
    await this.baseService.delete(`${resource}/category`, {
      ProductId: id,
      CategoryId: categoryId
    })
  }

  async getProductSpecificationAttributes(productId: string): Promise<ProductSpecificationAttributeDto[]> {
    return await this.baseService.get<ProductSpecificationAttributeDto[]>(`${resource}/specification-attribute/list?ProductId=${productId}`)
  }

  async addProductSpecificationAttribute(payload: UpsertProductSpecificationAttributeDto): Promise<void> {
    await this.baseService.post(`${resource}/specification-attribute`, payload)
  }

  async updateProductSpecificationAttribute(payload: UpdateProductSpecificationAttributeDto): Promise<void> {
    await this.baseService.put(`${resource}/specification-attribute`, payload)
  }

  async deleteProductSpecificationAttribute(payload: DeleteProductSpecificationAttributeDto): Promise<void> {
    await this.baseService.delete(`${resource}/specification-attribute`, payload)
  }

  async deleteProduct(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`)
  }

  async copyProduct(payload: CopyProductDto): Promise<string> {
    return await this.baseService.post<string>(`${resource}/copy`, payload)
  }
}

export default new ProductService()
