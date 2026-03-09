<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Products">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu
            v-if="hasHeaderActions"
            :items="headerActions"
            :content="{ align: 'end' }"
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
              <UFormField label="Name / SKU">
                <UInput
                  v-model="searchTerm"
                  placeholder="Search by name or sku..."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Published">
                <USelect
                  v-model="publishedFilter"
                  :items="publishedItems"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                  placeholder="Select"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Category">
                <USelectMenu
                  v-model="selectedCategoryIds"
                  :items="categoryOptions"
                  multiple
                  searchable
                  placeholder="Select category"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Brand">
                <USelectMenu
                  v-model="selectedBrandIds"
                  :items="brandOptions"
                  multiple
                  searchable
                  placeholder="Select brand"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="flex mt-5">
              <UButton
                type="submit"
                label="Search"
                icon="solar:minimalistic-magnifer-line-duotone"
                color="primary"
                variant="solid"
                class="w-full sm:w-auto cursor-pointer"
              />
            </div>
          </UForm>
        </template>
      </UCollapsible>

      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
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
        <template #image-cell="{ row }">
          <div class="flex items-center">
            <img
              v-if="row.original.Pictures?.[0]?.Url"
              :src="row.original.Pictures[0].Url"
              alt=""
              class="h-10 w-10 rounded-lg object-cover border border-default bg-elevated/50"
              loading="lazy"
            >
            <div
              v-else
              class="h-10 w-10 rounded-lg border border-default bg-elevated/50"
            />
          </div>
        </template>

        <template #ProductType-cell="{ row }">
          {{ productTypeLabel(row.original.ProductType) }}
        </template>

        <template #Published-cell="{ row }">
          <UBadge :color="row.original.Published ? 'success' : 'error'" variant="subtle">
            {{ row.original.Published ? 'Published' : 'Unpublished' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip v-if="canEdit" text="Edit">
              <UButton
                icon="i-solar:pen-new-square-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
                :to="row.original.Id ? `/product/edit/${row.original.Id}` : undefined"
                :disabled="!row.original.Id"
              />
            </UTooltip>

            <UTooltip v-if="canDelete" text="Delete">
              <UButton
                icon="i-solar:trash-bin-2-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10"
                :disabled="!row.original.Id"
                @click="openDeleteModal(row.original)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} products
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
              @click="fetchProducts"
            />
          </UTooltip>
          <USelect
            v-model="pageSize"
            :items="pageSizeOptions"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            class="w-24"
          />
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="data?.TotalCount || 0"
          />
        </div>
      </div>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete product"
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
              @click="onDeleteSingle"
            />
          </div>
        </template>
      </UModal>

      <UModal
        v-model:open="deleteSelectedModalOpen"
        title="Delete selected products"
        :description="`This will delete ${selectedIds.length} product(s). This action cannot be undone.`"
      >
        <template #body>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              :disabled="deleteLoading"
              @click="deleteSelectedModalOpen = false"
            />
            <UButton
              label="Delete"
              color="error"
              variant="solid"
              class="cursor-pointer"
              :loading="deleteLoading"
              @click="onDeleteSelected"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
  import { h } from 'vue'
  import BrandService from '~/services/BrandService'
  import CategoryService from '~/services/CategoryService'
  import ProductService from '~/services/ProductService'
  import { ProductType, type ProductDto } from '~/types/catalog/Product'
  import type { BrandDto } from '~/types/catalog/Brand'
  import type { CategoryDto } from '~/types/catalog/Category'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = ProductDto & { id: string }

  type UTableExpose = {
    tableApi?: {
      getFilteredSelectedRowModel: () => { rows: Array<{ original: TableRow }> }
    }
  }

  const UCheckbox = resolveComponent('UCheckbox')

  const toast = useToast()
  const { hasPermission } = useSitemap()
  const table = useTemplateRef<UTableExpose | null>('table')

  const page = ref(1)
  const pageSize = ref(50)
  const searchTerm = ref('')
  const publishedFilter = ref<'all' | 'published' | 'unpublished'>('all')
  const selectedCategoryIds = ref<string[]>([])
  const selectedBrandIds = ref<string[]>([])

  type SelectOption = { label: string, value: string }

  const categoryOptions = ref<SelectOption[]>([])
  const brandOptions = ref<SelectOption[]>([])

  const publishedItems = [
    { label: 'All', value: 'all' },
    { label: 'Only Published', value: 'published' },
    { label: 'Only Unpublished', value: 'unpublished' }
  ]

  const pageSizeOptions = [
    { label: '50', value: 50 },
    { label: '200', value: 200 },
    { label: '500', value: 500 },
    { label: '1000', value: 1000 }
  ]

  const rowSelection = ref<Record<string, boolean>>({})

  const canCreate = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Edit))
  const canDelete = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Delete))
  const canImport = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Import))
  const canExport = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Export))

  const selectedIds = computed<string[]>(() => {
    const rows = table.value?.tableApi?.getFilteredSelectedRowModel().rows ?? []
    return rows.map(r => r.original.Id).filter((id): id is string => Boolean(id))
  })

  const deleteModalOpen = ref(false)
  const deleteSelectedModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteId = ref<string | null>(null)

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Product',
        icon: 'i-solar:add-circle-bold-duotone',
        to: '/product/create'
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

    if (canDelete.value) {
      if (actions.length) {
        actions.push({
          type: 'separator'
        })
      }

      actions.push({
        label: 'Delete (Selected)',
        icon: 'i-solar:trash-bin-2-bold-duotone',
        color: 'error',
        disabled: selectedIds.value.length === 0,
        onSelect: () => {
          if (!selectedIds.value.length) return
          deleteSelectedModalOpen.value = true
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
        id: 'select',
        header: ({ table }) =>
          h(UCheckbox, {
            modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
            ariaLabel: 'Select all'
          }),
        cell: ({ row }) =>
          h(UCheckbox, {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
            ariaLabel: 'Select row'
          })
      },
      {
        id: 'image',
        header: 'Image'
      },
      {
        accessorKey: 'Name',
        header: 'Name'
      },
      {
        accessorKey: 'Sku',
        header: 'Sku'
      },
      {
        accessorKey: 'ProductType',
        header: 'Product Type'
      },
      {
        accessorKey: 'Published',
        header: 'Published'
      }
    ]

    if (canEdit.value || canDelete.value) {
      cols.push({
        id: 'actions',
        header: 'Actions'
      })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<ProductDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const productTypeLabel = (value: ProductType) => {
    return ProductType[value] ?? String(value)
  }

  const onSearch = () => {
    rowSelection.value = {}
    if (page.value !== 1) {
      page.value = 1
      return
    }

    fetchProducts()
  }

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories({
        CurrentPage: 1,
        PageSize: 1000
      })

      categoryOptions.value = [
        ...((response.Items || []) as CategoryDto[]).map(c => ({ label: c.Name, value: c.Id }))
      ]
    }
    catch (error) {
      console.error('Error fetching categories:', error)
      toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await BrandService.getBrands({
        CurrentPage: 1,
        PageSize: 1000
      })

      brandOptions.value = [
        ...((response.Items || []) as BrandDto[]).map(b => ({ label: b.Name, value: b.Id }))
      ]
    }
    catch (error) {
      console.error('Error fetching brands:', error)
      toast.add({ title: 'Error', description: 'Failed to load brands', color: 'error' })
    }
  }

  const fetchProducts = async () => {
    loading.value = true

    try {
      const publishedId = publishedFilter.value === 'all'
        ? 0
        : publishedFilter.value === 'published'
          ? 1
          : 2

      const response = await ProductService.getProducts({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        SearchTerm: searchTerm.value || undefined,
        PublishedId: publishedId,
        CategoryIds: selectedCategoryIds.value.length ? selectedCategoryIds.value : undefined,
        BrandIds: selectedBrandIds.value.length ? selectedBrandIds.value : undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching products:', error)
      toast.add({ title: 'Error', description: 'Failed to load products', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  watch([page, pageSize], ([nextPage, nextSize], [_prevPage, prevSize]) => {
    if (nextSize !== prevSize && nextPage !== 1) {
      page.value = 1
      return
    }
    rowSelection.value = {}
    fetchProducts()
  })

  onMounted(() => {
    fetchCategories()
    fetchBrands()
    fetchProducts()
  })

  const openDeleteModal = (row: TableRow) => {
    deleteId.value = row.Id
    deleteModalOpen.value = true
  }

  const onDeleteSingle = async () => {
    if (!deleteId.value) return

    deleteLoading.value = true

    try {
      await ProductService.deleteProduct(deleteId.value)
      toast.add({ title: 'Deleted', description: 'Product deleted successfully', color: 'success' })
      deleteModalOpen.value = false
      deleteId.value = null
      await fetchProducts()
    }
    catch (error) {
      console.error('Error deleting product:', error)
      toast.add({ title: 'Error', description: 'Failed to delete product', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }

  const onDeleteSelected = async () => {
    const ids = selectedIds.value
    if (!ids.length) return

    deleteLoading.value = true

    try {
      for (const id of ids) {
        await ProductService.deleteProduct(id)
      }

      toast.add({ title: 'Deleted', description: `${ids.length} product(s) deleted`, color: 'success' })
      deleteSelectedModalOpen.value = false
      rowSelection.value = {}
      await fetchProducts()
    }
    catch (error) {
      console.error('Error deleting selected products:', error)
      toast.add({ title: 'Error', description: 'Failed to delete selected products', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
