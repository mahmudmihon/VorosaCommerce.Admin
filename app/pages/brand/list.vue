<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Brands">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu :items="headerActions" :ui="{ item: 'cursor-pointer' }" class="cursor-pointer">
            <UButton
              label="Actions"
              icon="i-solar:round-alt-arrow-down-line-duotone"
              trailing
              color="neutral"
              variant="soft"
              class="cursor-pointer"
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
        <template #Published-cell="{ row }">
          <UBadge :color="row.original.Published ? 'success' : 'neutral'" variant="subtle">
            {{ row.original.Published ? 'Published' : 'Unpublished' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-solar:pen-new-square-bold-duotone"
              variant="ghost"
              color="neutral"
              class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
              :to="row.original.Id ? `/brand/edit/${row.original.Id}` : undefined"
              :disabled="!row.original.Id"
            />
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} brands
        </div>

        <div class="flex items-center gap-1.5">
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
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { useDebounceFn } from '@vueuse/core'
import BrandService from '~/services/BrandService'
import type { BrandDto } from '~/types/catalog/Brand'
import type { PagedList } from '~/types/common/PagedList'
import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

type TableRow = BrandDto & { id: string }

const toast = useToast()

const { hasPermission } = useSitemap()

const page = ref(1)
const pageSize = ref(20)
const nameFilter = ref('')

const canCreate = computed(() => hasPermission(PermissionSystemName.Brands, PermissionActionName.Create))
const canView = computed(() => hasPermission(PermissionSystemName.Brands, PermissionActionName.Edit))
const canImport = computed(() => hasPermission(PermissionSystemName.Brands, PermissionActionName.Import))
const canExport = computed(() => hasPermission(PermissionSystemName.Brands, PermissionActionName.Export))

const headerActions = computed<DropdownMenuItem[][]>(() => {
  const actions: DropdownMenuItem[] = []

  if (canCreate.value) {
    actions.push({
      label: 'Add Brand',
      icon: 'i-solar:add-circle-bold-duotone',
      to: '/brand/create'
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

const columns = computed<TableColumn<TableRow>[]>(() => {
  const cols: TableColumn<TableRow>[] = [
    {
      accessorKey: 'Name',
      header: 'Name'
    },
    {
      accessorKey: 'Published',
      header: 'Published'
    },
    {
      accessorKey: 'DisplayOrder',
      header: 'Display Order'
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

const loading = ref(false)
const data = ref<PagedList<BrandDto> | null>(null)

const tableData = computed<TableRow[]>(() => {
  if (!data.value || !data.value.Items) return []
  return data.value.Items.map(item => ({
    ...item,
    id: item.Id
  }))
})

const fetchBrands = async () => {
  loading.value = true

  try {
    const response = await BrandService.getBrands({
      CurrentPage: page.value,
      PageSize: pageSize.value,
      Name: nameFilter.value || undefined
    })

    data.value = response
  }
  catch (error) {
    console.error('Error fetching brands:', error)
    toast.add({ title: 'Error', description: 'Failed to load brands', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const debouncedFetch = useDebounceFn(() => {
  fetchBrands()
}, 500)

watch(nameFilter, () => {
  if (page.value !== 1) {
    page.value = 1
  }
  else {
    debouncedFetch()
  }
})

watch([page, pageSize], () => {
  fetchBrands()
})

onMounted(() => {
  fetchBrands()
})
</script>
