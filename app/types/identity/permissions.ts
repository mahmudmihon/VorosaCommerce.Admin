export const PermissionSystemName = {
  Dashboard: 'ManageDashboard',
  Products: 'ManageProducts',
  Categories: 'ManageCategories',
  Brands: 'ManageBrands',
  Customers: 'ManageCustomers',
  Reports: 'ManageReports',
  Roles: 'ManageRoles',
  Orders: 'ManageOrders',
  Discounts: 'ManageDiscounts',
  MessageTemplates: 'ManageMessageTemplates',
  PaymentMethods: 'ManagePaymentMethods',
  CurrentCarts: 'ManageCurrentCarts'
} as const

export const PermissionActionName = {
  List: 'List',
  View: 'View',
  Create: 'Create',
  Edit: 'Edit',
  Delete: 'Delete',
  Cancel: 'Cancel',
  Export: 'Export',
  Import: 'Import'
} as const

export type PermissionSystemNameType = typeof PermissionSystemName[keyof typeof PermissionSystemName]

export type PermissionActionNameType = typeof PermissionActionName[keyof typeof PermissionActionName]
