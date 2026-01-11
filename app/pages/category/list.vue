<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #right>
          <UDropdownMenu :items="headerActions">
            <UButton
              label="Actions"
              icon="i-solar:round-alt-arrow-down-line-duotone"
              trailing
              color="neutral"
              variant="soft"
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
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      >
        <template #Published-cell="{ row }">
          <UBadge :color="row.original.Published ? 'success' : 'error'" variant="subtle">
            {{ row.original.Published ? 'Published' : 'Unpublished' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-solar:pen-new-square-bold-duotone"
              variant="ghost"
              color="neutral"
              :to="row.original.Id ? `/category/edit/${row.original.Id}` : undefined"
              :disabled="!row.original.Id"
            />
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} categories
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
              @click="fetchCategories"
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
import type { CategoryDto } from '~/types/catalog/Category'
import type { PagedList } from '~/types/common/PagedList'
import CategoryService from '~/services/CategoryService'
import { useDebounceFn } from '@vueuse/core'
import { PermissionSystemName, PermissionActionName } from '~/types/identity/permissions'

// Define a type that includes the patched 'id'
type TableRow = CategoryDto & { id: string }

const toast = useToast()

const { hasPermission } = useSitemap()

// Pagination & Filter State
const page = ref(1)
const pageSize = ref(20)
const nameFilter = ref('')

const canCreate = computed(() => hasPermission(PermissionSystemName.Categories, PermissionActionName.Create))
const canView = computed(() => hasPermission(PermissionSystemName.Categories, PermissionActionName.Edit))
const canImport = computed(() => hasPermission(PermissionSystemName.Categories, PermissionActionName.Import))
const canExport = computed(() => hasPermission(PermissionSystemName.Categories, PermissionActionName.Export))

const headerActions = computed<DropdownMenuItem[][]>(() => {
  const actions: DropdownMenuItem[] = []

  if (canCreate.value) {
    actions.push({
      label: 'Add Category',
      icon: 'i-solar:add-circle-bold-duotone',
      to: '/category/create'
    })
  }

  if (canImport.value) {
    actions.push({
      label: 'Import',
      icon: 'i-solar:import-bold-duotone',
      onSelect: () => {
        toast.add({ title: 'Import', description: 'Import feature coming soon' })
      }
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

// Columns definition
const columns = computed<TableColumn<TableRow>[]>(() => {
  const cols: TableColumn<TableRow>[] = [
    {
      accessorKey: 'Name',
      header: 'Name',
    },
    {
      accessorKey: 'Published',
      header: 'Published',
    },
    {
      accessorKey: 'DisplayOrder',
      header: 'Order',
    }
  ]

  if (canView.value) {
    cols.push({
      id: 'actions',
      header: 'Actions'
    })
  }

  return cols
})

// Data Fetching
const loading = ref(false)
const data = ref<PagedList<CategoryDto> | null>(null)

// Computed property to ensure data shape is correct for UTable
const tableData = computed<TableRow[]>(() => {
  if (!data.value || !data.value.Items) return []
  return data.value.Items.map(item => ({
    ...item,
    // Ensure lowercase id exists for TanStack/UTable compatibility
    id: item.Id
  }))
})

const fetchCategories = async () => {
  loading.value = true

  try {
    const response = await CategoryService.getCategories({
      CurrentPage: page.value,
      PageSize: pageSize.value,
      Name: nameFilter.value || undefined
    })

    data.value = response
  }
  catch (error) {
    console.error('Error fetching categories:', error)
    toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

// Debounce the search
const debouncedFetch = useDebounceFn(() => {
  fetchCategories()
}, 500)

// Watchers
watch(nameFilter, () => {
  if (page.value !== 1) {
    page.value = 1
  } else {
    debouncedFetch()
  }
})

watch([page, pageSize], () => {
  fetchCategories()
})

onMounted(() => {
  fetchCategories()
})
</script>
