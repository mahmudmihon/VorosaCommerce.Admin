export type MenuDto = {
  Id: string
  TemplateId: string
  DisplayName: string
  Url: string
  DisplayOrder: number
  IsActive: boolean
  ParentId?: string
  Children: MenuDto[]
}

export type UpsertMenuDto = {
  Id?: string
  TemplateId: string
  DisplayName: string
  Url: string
  DisplayOrder: number
  IsActive: boolean
  ParentId?: string
}
