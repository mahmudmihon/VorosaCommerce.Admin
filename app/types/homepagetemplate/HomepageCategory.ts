export type HomepageCategoryDto = {
  Id: string
  TemplateId: string
  CategoryId: string
  Name: string
  ImageUrl?: string | null
  DisplayOrder: number
}

export type MapHomepageCategoriesDto = {
  TemplateId: string
  CategoryIds: string[]
}

export type UpdateHomepageCategoryDto = {
  Id: string
  TemplateId: string
  CategoryId: string
  ImageFile?: File | null
  UseDefaultImage: boolean
  DisplayOrder: number
}