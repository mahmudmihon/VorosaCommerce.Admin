import type { BaseEntity } from ".."

export type PictureDto = BaseEntity & {
  Url: string
  DisplayOrder: number
}

export interface PictureUpsertDto {
  PictureId?: string;
  Url?: string;
  File?: File;
}
