import type { BaseEntity } from '..'

export enum SpecificationAttributeType {
  Text = 10,
  HtmlText = 20,
  Hyperlink = 30
}

export type SpecificationAttributeDto = BaseEntity & {
  AttributeType: SpecificationAttributeType
  Name: string
  AllowFiltering: boolean
}

export type UpsertSpecificationAttributeDto = {
  Id?: string;
  Name: string;
  AttributeType: SpecificationAttributeType;
  AllowFiltering: boolean;
}