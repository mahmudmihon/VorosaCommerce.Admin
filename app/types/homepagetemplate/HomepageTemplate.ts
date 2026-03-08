import type { BaseEntity } from '..'

export type HomepageTemplateDto = BaseEntity & {
  Name: string
  IsDefault: boolean
  StartDate?: string
  EndDate?: string
}

export interface UpsertHomepageTemplateDto {
  Id?: string;
  Name: string;
  IsDefault: boolean;
  StartDate?: string;
  EndDate?: string;
}
