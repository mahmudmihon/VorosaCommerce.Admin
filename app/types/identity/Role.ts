import type { BaseEntity } from '..'

export type RoleDto = BaseEntity & {
  Name: string
  SystemName: string
  IsSystemRole: boolean
  Active: boolean
  CreatedOnUtc: string
}

export type UpsertRoleDto = {
  Id?: string
  Name: string
  SystemName: string
  Active: boolean
}
