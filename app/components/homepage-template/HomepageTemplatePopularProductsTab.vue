<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:shop-2-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Popular Products</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
        @click="addModalOpen = true"
      >
        Map Products
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Map this template to popular products</p>

    <UTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      class="mt-6"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
      }"
    />

    <UModal v-model:open="addModalOpen" title="Add Products" :ui="{ content: 'w-full sm:max-w-5xl' }">
      <template #body>
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
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

          <div class="flex justify-end gap-2">
            <UButton
              label="Search"
              icon="solar:minimalistic-magnifer-line-duotone"
              color="primary"
              variant="solid"
              class="cursor-pointer"
              :loading="productsLoading"
              @click="onApplyFilters"
            />

            <UButton
              label="Import"
              icon="i-solar:import-bold-duotone"
              color="secondary"
              variant="soft"
              class="cursor-pointer"
              @click="onImport"
            />
          </div>

          <div class="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 my-10">
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-medium">Selected Products</div>
              <UButton
                v-if="selectedProducts.length"
                label="Add Products"
                icon="i-solar:add-circle-bold-duotone"
                color="primary"
                variant="outline"
                class="cursor-pointer rounded-lg px-3"
                :loading="mapLoading"
                @click="onAddProducts"
              />
            </div>
            <div v-if="selectedProducts.length" class="mt-3 flex flex-wrap gap-2">
              <UBadge
                v-for="product in selectedProducts"
                :key="product.Id"
                color="neutral"
                variant="subtle"
                class="flex items-center gap-1 pr-1"
              >
                <span>{{ product.Name }} ({{ product.Sku }})</span>
                <UButton
                  icon="i-solar:close-circle-bold-duotone"
                  variant="ghost"
                  color="error"
                  size="xs"
                  class="cursor-pointer"
                  @click="removeSelectedProduct(product.Id)"
                />
              </UBadge>
            </div>
            <div v-else class="mt-2 text-sm text-muted-foreground">
              No products selected.
            </div>
          </div>

          <div v-if="!productsRequested" class="text-sm text-muted-foreground">
            Apply filters to view products.
          </div>

          <div v-else class="space-y-4">
            <UTable
              ref="selectableTable"
              v-model:row-selection="rowSelection"
              :data="productTableData"
              :columns="productColumns"
              :get-row-id="getRowId"
              :loading="productsLoading"
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
                <UIcon
                  :name="row.original.Published ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
                  :class="row.original.Published ? 'text-primary' : 'text-red-500'"
                  class="size-5"
                />
              </template>
            </UTable>

            <div class="flex items-center justify-between gap-3 border-t border-default pt-4">
              <div class="text-sm text-muted">
                Total {{ productsData?.TotalCount || 0 }} products
              </div>

              <div class="flex items-center gap-1.5">
                <UTooltip text="Refresh">
                  <UButton
                    class="cursor-pointer"
                    icon="i-solar:refresh-bold-duotone"
                    color="neutral"
                    variant="outline"
                    :loading="productsLoading"
                    square
                    @click="fetchSelectableProducts"
                  />
                </UTooltip>
                <UPagination
                  v-model:page="page"
                  :items-per-page="pageSize"
                  :total="productsData?.TotalCount || 0"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              @click="addModalOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { Icon } from '@iconify/vue'
import type { PagedList } from '~/types/common/PagedList'
import type { ProductDto } from '~/types/catalog/Product'
import type { HomepageProductDto } from '~/types/homepagetemplate/HomepageProduct'
import { HomepageProductType } from '~/types/homepagetemplate/HomepageProduct'
import HomepageProductService from '~/services/HomepageProductService'
import ProductService from '~/services/ProductService'
import CategoryService from '~/services/CategoryService'
import BrandService from '~/services/BrandService'

const props = defineProps<{
  templateId: string
}>()

type ProductRow = ProductDto & { id: string }
type HomepageRow = HomepageProductDto & { id: string }

type UTableExpose = {
  tableApi?: {
    getFilteredSelectedRowModel: () => { rows: Array<{ original: ProductRow }> }
  }
}

const toast = useToast()
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const selectableTable = useTemplateRef<UTableExpose | null>('selectableTable')

const homepageProducts = ref<HomepageProductDto[]>([])
const loading = ref(false)
const addModalOpen = ref(false)
const mapLoading = ref(false)

const productsLoading = ref(false)
const productsData = ref<PagedList<ProductDto> | null>(null)
const rowSelection = ref<Record<string, boolean>>({})
const productsRequested = ref(false)
const page = ref(1)
const pageSize = ref(20)
const selectedProductMap = ref<Record<string, ProductDto>>({})

const searchTerm = ref('')
const publishedFilter = ref<'all' | 'published' | 'unpublished'>('all')
const selectedCategoryIds = ref<string[]>([])
const selectedBrandIds = ref<string[]>([])
const categoryOptions = ref<Array<{ label: string, value: string }>>([])
const brandOptions = ref<Array<{ label: string, value: string }>>([])

const publishedItems = [
  { label: 'All', value: 'all' },
  { label: 'Only Published', value: 'published' },
  { label: 'Only Unpublished', value: 'unpublished' }
]

const tableData = computed<HomepageRow[]>(() => {
  return homepageProducts.value.map(item => ({ ...item, id: item.Id }))
})

const columns = computed<TableColumn<HomepageRow>[]>(() => ([
  { accessorKey: 'Name', header: 'Name' },
  { accessorKey: 'Sku', header: 'Sku' },
  { accessorKey: 'DisplayOrder', header: 'Display Order' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(UButton, {
        icon: 'i-solar:trash-bin-2-bold-duotone',
        variant: 'ghost',
        color: 'neutral',
        class: 'cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10',
        onClick: () => onDelete(row.original.Id)
      })
  }
]))

const productTableData = computed<ProductRow[]>(() => {
  if (!productsData.value?.Items) return []
  return productsData.value.Items.map(item => ({ ...item, id: item.Id }))
})

const productColumns = computed<TableColumn<ProductRow>[]>(() => ([
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
  { accessorKey: 'Name', header: 'Name' },
  { accessorKey: 'Sku', header: 'Sku' },
  { accessorKey: 'Published', header: 'Published' }
]))

const selectedProducts = computed<ProductDto[]>(() => {
  return Object.values(selectedProductMap.value).sort((a, b) => a.Name.localeCompare(b.Name))
})

const selectedProductIds = computed<string[]>(() => {
  return Object.keys(selectedProductMap.value)
})

const fetchHomepageProducts = async () => {
  if (!props.templateId) return

  loading.value = true
  try {
    homepageProducts.value = await HomepageProductService.getHomepageProducts(props.templateId, HomepageProductType.Popular)
  }
  catch (error) {
    console.error('Failed to fetch homepage products', error)
    toast.add({ title: 'Error', description: 'Failed to load popular products', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await CategoryService.getCategories({ CurrentPage: 1, PageSize: 1000 })
    categoryOptions.value = (response.Items || []).map(c => ({ label: c.Name, value: c.Id }))
  }
  catch (error) {
    console.error('Error fetching categories:', error)
    toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
  }
}

const fetchBrands = async () => {
  try {
    const response = await BrandService.getBrands({ CurrentPage: 1, PageSize: 1000 })
    brandOptions.value = (response.Items || []).map(b => ({ label: b.Name, value: b.Id }))
  } catch (error) {
    console.error('Error fetching brands:', error)
    toast.add({ title: 'Error', description: 'Failed to load brands', color: 'error' })
  }
}

const fetchSelectableProducts = async () => {
  productsLoading.value = true

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

    productsData.value = response
  }
  catch (error) {
    console.error('Error fetching products:', error)
    toast.add({ title: 'Error', description: 'Failed to load products', color: 'error' })
  }
  finally {
    productsLoading.value = false
  }
}

const onApplyFilters = () => {
  page.value = 1
  productsRequested.value = true
  fetchSelectableProducts()
}

const onImport = () => {
  toast.add({ title: 'Import', description: 'Import is not available yet', color: 'info' })
}

const onAddProducts = async () => {
  if (!selectedProductIds.value.length) return

  mapLoading.value = true

  try {
    await HomepageProductService.mapHomepageProducts({
      TemplateId: props.templateId,
      ProductType: HomepageProductType.Popular,
      ProductIds: selectedProductIds.value
    })
    toast.add({ title: 'Success', description: 'Products added successfully', color: 'success' })
    addModalOpen.value = false
    rowSelection.value = {}
    selectedProductMap.value = {}
    await fetchHomepageProducts()
  }
  catch (error) {
    console.error('Error adding products:', error)
    toast.add({ title: 'Error', description: 'Failed to add products', color: 'error' })
  }
  finally {
    mapLoading.value = false
  }
}

const onDelete = (id: string) => {
  if (!id) return
  toast.add({ title: 'Info', description: 'Delete is not available yet', color: 'info' })
}

onMounted(() => {
  fetchHomepageProducts()
})

watch(addModalOpen, (value) => {
  if (!value) return
  if (!categoryOptions.value.length) {
    fetchCategories()
  }
  if (!brandOptions.value.length) {
    fetchBrands()
  }
  productsRequested.value = false
  productsData.value = null
  rowSelection.value = {}
  selectedProductMap.value = {}
  page.value = 1
})

watch([page, pageSize], () => {
  if (!productsRequested.value) return
  fetchSelectableProducts()
})

const syncRowSelection = () => {
  const selection: Record<string, boolean> = {}
  for (const item of productTableData.value) {
    if (selectedProductMap.value[item.Id]) {
      selection[item.id] = true
    }
  }
  rowSelection.value = selection
}

const updateSelectedFromPage = () => {
  const pageIds = new Set(productTableData.value.map(item => item.Id))
  const nextMap = Object.fromEntries(
    Object.entries(selectedProductMap.value).filter(([id]) => !pageIds.has(id))
  ) as Record<string, ProductDto>

  for (const item of productTableData.value) {
    if (rowSelection.value[item.id]) {
      nextMap[item.Id] = item
    }
  }

  selectedProductMap.value = nextMap
}

watch(productTableData, () => {
  if (!productsRequested.value) return
  syncRowSelection()
})

watch(rowSelection, () => {
  if (!productsRequested.value) return
  updateSelectedFromPage()
}, { deep: true })

const getRowId = (row: ProductRow) => row.Id

const removeSelectedProduct = (id: string) => {
  const { [id]: _removed, ...rest } = selectedProductMap.value
  selectedProductMap.value = rest
  const { [id]: _selection, ...nextSelection } = rowSelection.value
  rowSelection.value = nextSelection
}
</script>
