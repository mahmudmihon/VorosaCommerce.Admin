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

export interface PictureUpsertDto {
  PictureId?: string;
  Url?: string;
  File?: File;
}

export interface UpsertCategoryInfoDto {
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

export interface UpsertCategorySEOInfoDto {
  Id: string;
  SeName: string;
  MetaKeywords?: string;
  MetaDescription?: string;
  MetaTitle?: string;
}
