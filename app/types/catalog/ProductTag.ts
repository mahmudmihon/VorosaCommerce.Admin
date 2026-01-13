import type { BaseEntity } from '..'

export type ProductTagDto = BaseEntity & {
  Name: string
  Count: number
}

export interface UpsertProductTagDto {
  Id?: string;
  Name: string;
}