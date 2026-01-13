import type { BaseEntity } from ".."

export type PictureDto = BaseEntity & {
  Url: string
}

export interface PictureUpsertDto {
  PictureId?: string;
  Url?: string;
  File?: File;
}
