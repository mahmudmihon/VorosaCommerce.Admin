import type { BaseEntity } from '..'

export enum DiscountType {
  AssignedToCategories = 10,
  AssignedToProducts = 20,
  AssignedToBrands = 30,
  AssignedToShipping = 40,
  AssignedToOrderSubtotal = 50,
  AssignedToOrderTotal = 60
}

export enum DiscountLimitationType {
  NoLimits = 10,
  NTimes = 20,
  NTimesPerUser = 30
}

export enum DiscountEntityType {
  Product = 10,
  Category = 20,
  Brand = 30,
  Customer = 40
}

export enum DiscountRuleType {
  AssignToSpecificCustomer = 10,
  HasAllProducts = 20,
  HasOneofAnyProducts = 30,
  SpentSpecificAmount = 40,
  SubtotalAmountInCart = 50
}

export type DiscountDto = BaseEntity & {
  DiscountType: DiscountType
  Name: string
  UsePercentage?: boolean | null
  DiscountPercentage?: number | null
  DiscountAmount?: number | null
  MaximumDiscountAmount?: number | null
  StartDateUtc?: string | null
  EndDateUtc?: string | null
  RequiresCouponCode?: boolean | null
  IsCumulative?: boolean | null
  DiscountLimitationType?: DiscountLimitationType | null
  LimitationTimes?: number | null
  IsEnabled?: boolean | null
}

export type DiscountEntityDto = {
  Id: string
  DiscountId: string
  EntityType: DiscountEntityType
  EntityId: string
  EntityName: string
}

export type DiscountEntityMapDto = {
  DiscountId: string
  EntityType: DiscountEntityType
  EntityIds: string[]
}

export type DiscountRuleCreateDto = {
  DiscountId: string
  RuleType: DiscountRuleType
  SpentSpecificAmount: number
  SubtotalAmountInCart: number
}

export type UpsertDiscountDto = {
  Id?: string
  DiscountType: DiscountType
  Name: string
  UsePercentage?: boolean | null
  DiscountPercentage?: number | null
  DiscountAmount?: number | null
  MaximumDiscountAmount?: number | null
  StartDateUtc?: string | null
  EndDateUtc?: string | null
  RequiresCouponCode?: boolean | null
  IsCumulative?: boolean | null
  DiscountLimitationType?: DiscountLimitationType | null
  LimitationTimes?: number | null
  IsEnabled?: boolean | null
}
