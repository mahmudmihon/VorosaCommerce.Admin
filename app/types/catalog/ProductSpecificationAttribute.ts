export enum SpecificationAttributeType {
  Text = 10,
  HtmlText = 20,
  Hyperlink = 30
}

export type ProductSpecificationAttributeDto = {
  Id: string
  SpecificationAttributeId: string
  SpecificationAttributeName?: string
  AttributeType: SpecificationAttributeType
  Name?: string
  Value: string
  DisplayOrder: number
}

export type UpsertProductSpecificationAttributeDto = {
  ProductId: string
  SpecificationAttributeId: string
  Value: string
  DisplayOrder: number
}

export type UpdateProductSpecificationAttributeDto = {
  ProductId: string
  SpecificationId: string
  SpecificationAttributeId: string
  Value: string
  DisplayOrder: number
}

export type DeleteProductSpecificationAttributeDto = {
  ProductId: string
  SpecificationId: string
}