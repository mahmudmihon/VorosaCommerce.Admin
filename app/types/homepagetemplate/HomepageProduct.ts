export enum HomepageProductType {
  Popular = 10,
  New = 20
}

export type HomepageProductDto = {
  Id: string
  TemplateId: string
  ProductType: HomepageProductType
  ProductId: string
  Name: string
  Sku: string
  ImageUrl?: string | null
  TagLine?: string | null
  DisplayOrder: number
  IsDefault: boolean
}

export type UpsertHomepageProductDto = {
  Id?: string
  TemplateId: string
  ProductType: HomepageProductType
  ProductId: string
  DisplayOrder: number
  IsDefault: boolean
  TagLine?: string | null
}

export type MapHomepageProductsDto = {
  TemplateId: string
  ProductType: HomepageProductType
  ProductIds: string[]
}