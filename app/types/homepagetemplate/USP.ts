export type USPDto = {
  Id: string
  TemplateId: string
  ImageUrl: string
  Title: string
  Description: string
  DisplayOrder: number
}

export type UpsertUSPDto = {
  Id?: string
  TemplateId: string
  Title: string
  Description: string
  Image?: File | null
  DisplayOrder: number
}