import type { BaseEntity } from ".."

export type PictureDto = BaseEntity & {
  Url: string
  DisplayOrder: number
  IsDefault: boolean
}

export interface PictureUpsertDto {
  PictureId?: string;
  Url?: string;
  File?: File;
  DisplayOrder?: number;
  IsDefault?: boolean;
}
