import type { BaseEntity } from '..'

export type ProductAttributeDto = BaseEntity & {
  Name: string
}

export interface UpsertProductAttributeDto {
  Id?: string;
  Name: string;
}