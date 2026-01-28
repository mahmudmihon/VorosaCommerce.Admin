export type PermissionDto = {
  Id: string
  Name: string
  SystemName: string
  Category: string
  Actions: string[]
}

export type RolePermissionSummaryDto = {
  AllPermissions: PermissionDto[]
  RolePermissions: PermissionDto[]
}

export type RolePermissionUpdateDto = {
  RoleId: string
  Permissions: PermissionDto[]
}
