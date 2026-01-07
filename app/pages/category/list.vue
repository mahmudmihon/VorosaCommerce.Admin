<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #right>
          <UButton
            label="Add Category"
            icon="i-lucide-plus"
            to="/category/create"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col flex-1 gap-4">
        <div class="flex items-center gap-2">
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
          class="flex-1"
        >
          <template #Published-cell="{ row }">
            <UBadge :color="row.original.Published ? 'success' : 'neutral'" variant="subtle">
              {{ row.original.Published ? 'Published' : 'Unpublished' }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-edit"
                variant="ghost"
                color="neutral"
                :to="row.original.Id ? `/category/edit/${row.original.Id}` : undefined"
                :disabled="!row.original.Id"
              />
            </div>
          </template>
        </UTable>

        <div class="flex items-center justify-between border-t border-default pt-4">
          <div class="text-sm text-muted">
            Total {{ data?.TotalCount || 0 }} categories
          </div>

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
import type { TableColumn } from '@nuxt/ui'
import type { CategoryDto } from '~/types/catalog/Category'
import type { PagedList } from '~/types/common/PagedList'
import CategoryService from '~/services/CategoryService'
import { useDebounceFn } from '@vueuse/core'

// Define a type that includes the patched 'id'
type TableRow = CategoryDto & { id: string }

const toast = useToast()
const table = useTemplateRef('table')

// Pagination & Filter State
const page = ref(1)
const pageSize = ref(20)
const nameFilter = ref('')

// Columns definition
const columns: TableColumn<TableRow>[] = [
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
  },
  {
    id: 'actions',
    header: 'Actions'
  }
]

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
    console.log('Fetching categories...')
    const response = await CategoryService.getCategories({
      CurrentPage: page.value,
      PageSize: pageSize.value,
      Name: nameFilter.value || undefined
    })
    console.log('Categories response:', response)
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
