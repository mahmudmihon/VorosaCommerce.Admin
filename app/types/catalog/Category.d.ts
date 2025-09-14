export interface Category extends BaseEntity {
  Name: string
  Description: string
  MetaKeywords: string
  MetaDescription: string
  MetaTitle: string
  ParentCategoryId: string
  PictureUrl: string
  IncludeInMenu: boolean
  Published: boolean
  DisplayOrder: number
}