import type { BaseEntity } from '..'
import type { PictureDto, PictureUpsertDto } from '../common/Picture'

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
  GroupedProduct = 20
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

export interface UpsertProductInfoDto {
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
  Pictures: PictureUpsertDto[]
}

export interface UpsertProductSEOInfoDto {
  Id: string
  SeName: string
  MetaKeywords?: string
  MetaDescription?: string
  MetaTitle?: string
}
