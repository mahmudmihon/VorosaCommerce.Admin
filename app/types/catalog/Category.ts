import type { BaseEntity } from ".."
import type { PictureDto, PictureUpsertDto } from "../common/Picture"

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

export type UpsertCategoryInfoDto = {
  Id?: string;
  Name: string;
  Description?: string;
  ParentCategoryId?: string;
  IncludeInMenu: boolean;
  ShowOnHomePage: boolean;
  Published: boolean;
  DisplayOrder: number;
  Picture: PictureUpsertDto;
  Icon: PictureUpsertDto;
}

export type UpsertCategorySEOInfoDto = {
  Id: string;
  SeName: string;
  MetaKeywords?: string;
  MetaDescription?: string;
  MetaTitle?: string;
}
