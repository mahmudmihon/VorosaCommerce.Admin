import type { BaseEntity } from '..'
import type { PictureDto } from '../common/Picture'

export enum ManageInventoryMethod {
  DontManageStock = 10,
  ManageStock = 20,
  ManageStockByAttributes = 30
}

export enum LowStockActivity {
  Nothing = 10,
  NotifyAdmin = 20,
  Unpublish = 30,
  MarkAsOutOfStock = 40
}

export enum ProductType {
  SimpleProduct = 10,
  DigitalProduct = 20,
  BundleProduct = 30
}

export type ProductDto = BaseEntity & {
  ProductType: ProductType
  Name: string
  SeName?: string
  Sku: string
  ShortDescription: string
  FullDescription: string
  MetaTitle: string
  MetaKeywords: string
  MetaDescription: string
  StockAvailability: boolean
  StockQuantity: number
  ReservedQuantity: number
  OrderMinimumQuantity: number
  OrderMaximumQuantity: number
  Price: number
  OldPrice: number
  BrandId: string
  ManageInventoryMethod: ManageInventoryMethod
  LowStockActivity: LowStockActivity
  NotifyAdminForQuantityBelow: number
  AvailableStartDateTimeUtc?: string | null
  AvailableEndDateTimeUtc?: string | null
  DisplayOrder: number
  Published: boolean
  Tags: string[]
  Pictures: PictureDto[]
}

export type UpsertProductInfoDto = {
  Id?: string
  ProductType: ProductType
  Name: string
  Sku: string
  ShortDescription?: string
  FullDescription?: string
  Price: number
  OldPrice: number
  BrandId?: string
  AvailableStartDateTimeUtc?: string | null
  AvailableEndDateTimeUtc?: string | null
  DisplayOrder: number
  Published: boolean
  Tags: string[]
}

export type UpsertProductSEOInfoDto = {
  Id: string
  SeName: string
  MetaKeywords?: string
  MetaDescription?: string
  MetaTitle?: string
}

export type UpsertProductInventoryDto = {
  ProductId: string
  ManageInventoryMethod: ManageInventoryMethod
  LowStockActivity: LowStockActivity
  NotifyAdminForQuantityBelow: number
  StockQuantity: number
  ReservedQuantity: number
  OrderMinimumQuantity: number
  OrderMaximumQuantity: number
}

export type CopyProductDto = {
  ProductId: string
  Name?: string | null
  Published: boolean
  CopyImages: boolean
}

export type ProductCategoryDto = {
  CategoryId: string
  CategoryName: string
  DisplayOrder: number
}

export type UpsertProductCategoryDto = {
  ProductId: string
  CategoryId: string
  DisplayOrder: number
}

export type UpdateProductPictureDto = {
  ProductId: string
  PictureId: string
  DisplayOrder: number
  IsDefault: boolean
}
