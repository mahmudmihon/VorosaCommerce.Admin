<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Roles">
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
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="nameFilter"
          icon="i-lucide-search"
          placeholder="Filter by name..."
          class="max-w-sm"
        />
      </div>

      <UTable
        ref="table"
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
        <template #Active-cell="{ row }">
          <UIcon
            :name="row.original.Active ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
            :class="row.original.Active ? 'text-primary' : 'text-red-500'"
            class="size-5"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              v-if="canEdit && !row.original.IsSystemRole"
              icon="i-solar:pen-new-square-bold-duotone"
              variant="ghost"
              color="neutral"
              class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
              :to="row.original.Id ? `/role/edit/${row.original.Id}` : undefined"
              :disabled="!row.original.Id"
            />
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} roles
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
              @click="fetchRoles"
            />
          </UTooltip>
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="data?.TotalCount || 0"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
  import { useDebounceFn } from '@vueuse/core'
  import RoleService from '~/services/RoleService'
  import type { RoleDto } from '~/types/identity/Role'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = RoleDto & { id: string }

  const toast = useToast()

  const { hasPermission } = useSitemap()

  const page = ref(1)
  const pageSize = ref(20)
  const nameFilter = ref('')

  const canCreate = computed(() => hasPermission(PermissionSystemName.Roles, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Roles, PermissionActionName.Edit))
  const canExport = computed(() => hasPermission(PermissionSystemName.Roles, PermissionActionName.Export))

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Role',
        icon: 'i-solar:add-circle-bold-duotone',
        to: '/role/create'
      })
    }

    if (canExport.value) {
      actions.push({
        label: 'Export',
        icon: 'i-solar:export-bold-duotone',
        onSelect: () => {
          toast.add({ title: 'Export', description: 'Export feature coming soon' })
        }
      })
    }

    return [actions]
  })

  const hasHeaderActions = computed(() => {
    return headerActions.value.some(group => group.length > 0)
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    const cols: TableColumn<TableRow>[] = [
      {
        accessorKey: 'Name',
        header: 'Name'
      },
      {
        accessorKey: 'Active',
        header: 'Active'
      }
    ]

    if (canEdit.value) {
      cols.push({
        id: 'actions',
        header: 'Actions'
      })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<RoleDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const fetchRoles = async () => {
    loading.value = true

    try {
      const response = await RoleService.getRoles({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        Name: nameFilter.value || undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching roles:', error)
      toast.add({ title: 'Error', description: 'Failed to load roles', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchRoles()
  }, 500)

  watch(nameFilter, () => {
    if (page.value !== 1) {
      page.value = 1
    } else {
      debouncedFetch()
    }
  })

  watch([page, pageSize], () => {
    fetchRoles()
  })

  onMounted(() => {
    fetchRoles()
  })
</script>
