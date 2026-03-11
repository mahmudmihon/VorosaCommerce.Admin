import type { BaseEntity } from '..'
import type { PictureDto, PictureUpsertDto } from '../common/Picture'

export type BrandDto = BaseEntity & {
  Name: string
  SeName: string
  Description: string
  MetaTitle: string
  MetaKeywords: string
  MetaDescription: string
  Published: boolean
  DisplayOrder: number
  Picture: PictureDto
  Icon: PictureDto
}

export type UpsertBrandInfoDto = {
  Id?: string;
  Name: string;
  Description?: string;
  Published: boolean;
  DisplayOrder: number;
  Picture: PictureUpsertDto;
  Icon: PictureUpsertDto;
}

export type UpsertBrandSEOInfoDto = {
  Id: string;
  SeName: string;
  MetaKeywords?: string;
  MetaDescription?: string;
  MetaTitle?: string;
}
