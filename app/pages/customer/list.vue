<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Customers">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu
            v-if="hasHeaderActions"
            :items="headerActions"
            :ui="{ item: 'cursor-pointer' }"
            class="cursor-pointer"
          >
            <UButton
              icon="i-solar:menu-dots-bold-duotone"
              size="md"
              color="success"
              variant="solid"
              class="cursor-pointer rounded-lg px-2"
            />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCollapsible :default-open="true" class="w-full">
        <template #default="{ open }">
          <UButton
            label="Filters"
            color="neutral"
            variant="soft"
            icon="i-solar:filter-bold-duotone"
            trailing-icon="solar:round-alt-arrow-down-line-duotone"
            block
            class="font-semibold cursor-pointer"
            :ui="{
              base: 'justify-between',
              trailingIcon: `${open ? 'rotate-180 ' : ''}transition-transform duration-200`
            }"
          />
        </template>

        <template #content>
          <UForm class="pt-5 pb-10" @submit="onSearch">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <UFormField label="Search">
                <UInput
                  v-model="searchTerm"
                  placeholder="Search by name, email or phone..."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Roles">
                <USelectMenu
                  v-model="selectedRoleIds"
                  :items="roleOptions"
                  multiple
                  searchable
                  placeholder="Select roles"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>
          </UForm>
        </template>
      </UCollapsible>

      <UTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        class="shrink-0"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default font-semibold',
          separator: 'h-0'
        }"
      >
        <template #FullName-cell="{ row }">
          <span>{{ formatFullName(row.original.FirstName, row.original.LastName) }}</span>
        </template>

        <template #Active-cell="{ row }">
          <UIcon
            :name="row.original.Active ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
            :class="row.original.Active ? 'text-primary' : 'text-red-500'"
            class="size-5"
          />
        </template>

        <template #CreatedOnUtc-cell="{ row }">
          <span>{{ formatLocalDate(row.original.CreatedOnUtc) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              v-if="canEdit"
              icon="i-solar:pen-new-square-bold-duotone"
              variant="ghost"
              color="neutral"
              class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
              :to="row.original.Id ? `/customer/edit/${row.original.Id}` : undefined"
              :disabled="!row.original.Id"
            />
            <UButton
              v-if="canDelete"
              icon="i-solar:trash-bin-2-bold-duotone"
              variant="ghost"
              color="neutral"
              class="cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10"
              :disabled="!row.original.Id"
              @click="openDeleteModal(row.original)"
            />
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} customers
        </div>

        <div class="flex items-center gap-1.5">
          <UTooltip text="Refresh">
            <UButton
              class="cursor-pointer"
              icon="i-solar:refresh-bold-duotone"
              color="neutral"
              variant="outline"
              :loading="loading"
              square
              @click="fetchCustomers"
            />
          </UTooltip>
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="data?.TotalCount || 0"
          />
        </div>
      </div>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete customer"
        description="This action cannot be undone."
      >
        <template #body>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              :disabled="deleteLoading"
              @click="deleteModalOpen = false"
            />
            <UButton
              label="Delete"
              color="error"
              variant="solid"
              class="cursor-pointer"
              :loading="deleteLoading"
              @click="onDelete"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
  import { useDebounceFn } from '@vueuse/core'
  import CustomerService from '~/services/CustomerService'
  import RoleService from '~/services/RoleService'
  import type { CustomerDto } from '~/types/identity/Customer'
  import type { RoleDto } from '~/types/identity/Role'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = CustomerDto & { id: string }

  const toast = useToast()
  const { hasPermission } = useSitemap()

  const page = ref(1)
  const pageSize = ref(20)
  const searchTerm = ref('')
  const selectedRoleIds = ref<string[]>([])

  const canCreate = computed(() => hasPermission(PermissionSystemName.Customers, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Customers, PermissionActionName.Edit))
  const canDelete = computed(() => hasPermission(PermissionSystemName.Customers, PermissionActionName.Delete))

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Customer',
        icon: 'i-solar:add-circle-bold-duotone',
        to: '/customer/create'
      })
    }

    return [actions]
  })

  const hasHeaderActions = computed(() => {
    return headerActions.value.some(group => group.length > 0)
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    const cols: TableColumn<TableRow>[] = [
      { id: 'FullName', header: 'Name' },
      { accessorKey: 'Email', header: 'Email' },
      { accessorKey: 'Active', header: 'Active' },
      { accessorKey: 'CreatedOnUtc', header: 'Registered on' }
    ]

    if (canEdit.value || canDelete.value) {
      cols.push({ id: 'actions', header: 'Actions' })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<CustomerDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const roleOptions = ref<Array<{ label: string, value: string }>>([])

  const fetchRoles = async () => {
    try {
      const resp = await RoleService.getRoles({ CurrentPage: 1, PageSize: 1000 })
      roleOptions.value = (resp.Items || []).map((role: RoleDto) => ({ label: role.Name, value: role.Id }))
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load roles', color: 'error' })
    }
  }

  const fetchCustomers = async () => {
    loading.value = true

    try {
      const response = await CustomerService.getCustomers({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        SearchTerm: searchTerm.value || undefined,
        RoleIds: selectedRoleIds.value.length ? selectedRoleIds.value : undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching customers:', error)
      toast.add({ title: 'Error', description: 'Failed to load customers', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const onSearch = () => {
    if (page.value !== 1) {
      page.value = 1
    }
    fetchCustomers()
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchCustomers()
  }, 500)

  watch(searchTerm, () => {
    if (page.value !== 1) {
      page.value = 1
    }
    else {
      debouncedFetch()
    }
  })

  watch(selectedRoleIds, () => {
    if (page.value !== 1) {
      page.value = 1
    }
    else {
      debouncedFetch()
    }
  })

  watch([page, pageSize], () => {
    fetchCustomers()
  })

  onMounted(async () => {
    await fetchRoles()
    await fetchCustomers()
  })

  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteTarget = ref<CustomerDto | null>(null)

  const openDeleteModal = (customer: CustomerDto) => {
    if (!canDelete.value) return
    deleteTarget.value = customer
    deleteModalOpen.value = true
  }

  const onDelete = async () => {
    const target = deleteTarget.value
    if (!target?.Id) return

    deleteLoading.value = true
    try {
      await CustomerService.deleteCustomer(target.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Customer deleted successfully', color: 'success' })
      await fetchCustomers()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete customer', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }

  const formatLocalDate = (utcDate: string) => {
    return new Date(utcDate).toLocaleString()
  }

  const formatFullName = (firstName?: string | null, lastName?: string | null) => {
    return [firstName, lastName].filter(Boolean).join(' ')
  }
</script>
