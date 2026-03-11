import type { BaseEntity } from '..'
import type { PictureDto } from '../common/Picture'

export type ProductAttributeDto = BaseEntity & {
  Name: string
  AllowFiltering: boolean
}

export type UpsertProductAttributeDto = {
  Id?: string;
  Name: string;
  AllowFiltering: boolean;
}

export enum AttributeControlType {
  DropdownList = 10,
  RadioList = 20,
  Checkboxes = 30,
  ColorSquares = 40,
  ImageSquares = 50
}

export type ProductAttributeValueDto = {
  Id: string
  Name: string
  DisplayOrder: number
  Picture?: PictureDto | null
  ColorSquaresRgb: string
  ImageSquaresPictureId: string
}

export type ProductAttributeMappingDto = {
  Id: string
  ProductAttributeId: string
  ProductAttributeName: string
  AttributeControlType: AttributeControlType
  Text: string
  DisplayOrder: number
  Values: ProductAttributeValueDto[]
}

export type ProductAttributeCombinationDto = {
  Id: string
  Attributes: string
  StockQuantity: number
  OverriddenPrice: number
}

export type UpdateProductAttributeCombinationDto = {
  Id: string
  ProductId: string
  StockQuantity: number
  OverriddenPrice: number
}

export type UpsertProductAttributeValueDto = {
  Id?: string
  ProductId: string
  MappingId: string
  Name: string
  DisplayOrder: number
  ColorSquaresRgb?: string | null
  ImageSquaresPictureId?: string | null
}

export type UpsertProductAttributeMappingDto = {
  ProductId: string
  ProductAttributeId: string
  AttributeControlType: AttributeControlType
  Text: string
  DisplayOrder: number
}
