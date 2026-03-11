export type LovedBrandDto = {
  Id: string
  Name: string
  LogoUrl: string
  Url: string
  DisplayOrder: number
}

export type UpsertLovedBrandDto = {
  Id?: string
  TemplateId: string
  Name: string
  Url: string
  Logo?: File | null
  DisplayOrder: number
}
