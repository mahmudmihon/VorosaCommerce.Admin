import type { BaseEntity } from '..'

export type ProductTagDto = BaseEntity & {
  Name: string
  Count: number
}

export type UpsertProductTagDto = {
  Id?: string;
  Name: string;
}
