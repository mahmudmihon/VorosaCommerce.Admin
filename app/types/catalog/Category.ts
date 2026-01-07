import type { BaseEntity } from ".."
import type { PictureDto } from "../common/Picture"

export type CategoryDto = BaseEntity & {
  Name: string
  SeName: string
  Description: string
  MetaKeywords: string
  MetaDescription: string
  MetaTitle: string
  ParentCategoryId: string
  IncludeInMenu: boolean
  ShowOnHomePage: boolean
  Published: boolean
  DisplayOrder: number
  Picture: PictureDto
  Icon: PictureDto
}
