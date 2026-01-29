import type { BaseEntity } from '..'

export type CustomerDto = BaseEntity & {
  Username: string
  FirstName: string
  LastName: string
  PhoneNumber: string
  Email: string
  Active: boolean
  CreatedOnUtc: string
  Roles: string[]
}

export type UpsertCustomerDto = {
  Id?: string
  FirstName: string
  LastName: string
  Email: string
  Password?: string
  Active: boolean
  RoleId: string
}
