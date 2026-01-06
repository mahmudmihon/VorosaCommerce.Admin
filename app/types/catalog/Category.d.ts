export interface Category extends BaseEntity {
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
  Picture: Picture
  Icon: Picture
}
