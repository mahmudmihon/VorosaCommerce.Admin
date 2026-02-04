<template>
  <div class="space-y-4 p-4 pb-8">
    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:add-circle-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Add Requirement</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Choose rules customers must satisfy to use this discount</p>

      <div
        v-if="!showRequirementDetails"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"
      >
        <button
          v-for="card in requirementCards"
          :key="card.value"
          type="button"
          class="flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer"
          :class="selectedRuleType === card.value
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="selectedRuleType = card.value"
        >
          <span
            class="flex size-10 items-center justify-center rounded-xl"
            :class="card.iconClass"
          >
            <Icon :icon="card.icon" width="22" height="22" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">{{ card.label }}</span>
            <span class="text-xs text-muted-foreground">{{ card.description }}</span>
          </span>
        </button>
      </div>

      <div
        v-if="showRequirementDetails && selectedRequirement"
        class="mt-6 rounded-2xl border border-default bg-default/40 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span
              class="flex size-10 items-center justify-center rounded-xl"
              :class="selectedRequirement.iconClass"
            >
              <Icon :icon="selectedRequirement.icon" width="22" height="22" />
            </span>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-default">{{ selectedRequirement.label }}</span>
              <span class="text-xs text-muted-foreground">{{ selectedRequirement.description }}</span>
            </div>
          </div>
          <UButton
            icon="i-solar:close-circle-bold-duotone"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="clearSelection"
          />
        </div>

        <div v-if="showSpentSpecificAmount || showCartSubtotalAmount" class="mt-6 grid gap-4">
          <UFormField
            v-if="showSpentSpecificAmount"
            label="Minimum Amount Spent"
            name="MinimumAmountSpent"
            class="font-medium"
          >
            <UInput
              v-model="spentMinimumAmount"
              variant="outline"
              size="xl"
              type="number"
              :min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full rounded-2xl"
            />
            <template #help>
              <span class="text-muted-foreground text-xs">Total amount the customer must have spent historically</span>
            </template>
          </UFormField>

          <UFormField
            v-if="showCartSubtotalAmount"
            label="Minimum Cart Subtotal"
            name="MinimumCartSubtotal"
            class="font-medium"
          >
            <UInput
              v-model="cartSubtotalMinimumAmount"
              variant="outline"
              size="xl"
              type="number"
              :min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full rounded-2xl"
            />
            <template #help>
              <span class="text-muted-foreground text-xs">Minimum subtotal required in the shopping cart</span>
            </template>
          </UFormField>
        </div>

        <div v-else-if="showProductRequirement" class="mt-6 space-y-6">
          <GenericAlert
            v-if="!discountId"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <template v-else>
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
                label="Apply Filters"
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

            <UTable
              v-if="productsData"
              ref="selectableTable"
              v-model:row-selection="rowSelection"
              :data="productTableData"
              :columns="productColumns"
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
          </template>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            @click="clearSelection"
          />
          <UButton
            label="Add Requirement"
            icon="i-solar:add-circle-bold-duotone"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            :disabled="showProductRequirement && selectedProductIds.length === 0"
            :loading="mapLoading"
            @click="onAddRequirement"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import type { TableColumn } from '#ui/types'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import BrandService from '~/services/BrandService'
  import CategoryService from '~/services/CategoryService'
  import DiscountService from '~/services/DiscountService'
  import ProductService from '~/services/ProductService'
  import { DiscountEntityType, DiscountRuleType } from '~/types/catalog/Discount'
  import type { BrandDto } from '~/types/catalog/Brand'
  import type { CategoryDto } from '~/types/catalog/Category'
  import type { ProductDto } from '~/types/catalog/Product'
  import type { PagedList } from '~/types/common/PagedList'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    discountId?: string
  }>()

  type ProductRow = ProductDto & { id: string }

  type UTableExpose = {
    tableApi?: {
      getFilteredSelectedRowModel: () => { rows: Array<{ original: ProductRow }> }
    }
  }

  const toast = useToast()
  const UCheckbox = resolveComponent('UCheckbox')
  const selectableTable = useTemplateRef<UTableExpose | null>('selectableTable')
  const unsavedAlertTitle = 'Save general information first'
  const unsavedAlertDescription = 'Save the discount general information before adding product requirements.'
  const productsLoading = ref(false)
  const productsData = ref<PagedList<ProductDto> | null>(null)
  const searchTerm = ref('')
  const publishedFilter = ref<'all' | 'published' | 'unpublished'>('all')
  const selectedCategoryIds = ref<string[]>([])
  const selectedBrandIds = ref<string[]>([])
  const categoryOptions = ref<Array<{ label: string, value: string }>>([])
  const brandOptions = ref<Array<{ label: string, value: string }>>([])
  const rowSelection = ref<Record<string, boolean>>({})
  const mapLoading = ref(false)
  const maxPageSize = 1000

  const publishedItems = [
    { label: 'All', value: 'all' },
    { label: 'Only Published', value: 'published' },
    { label: 'Only Unpublished', value: 'unpublished' }
  ]

  const selectedRuleType = ref<DiscountRuleType | null>(null)
  const spentMinimumAmount = ref<number | null>(null)
  const cartSubtotalMinimumAmount = ref<number | null>(null)

  const requirementCards = computed(() => [
    {
      label: 'Customer Group',
      description: 'Must be assigned to customer group',
      value: DiscountRuleType.AssignToSpecificCustomer,
      icon: 'solar:users-group-rounded-bold-duotone',
      iconClass: 'bg-primary/10 text-primary'
    },
    {
      label: 'Spent Amount',
      description: 'Customer had spent x.xx amount',
      value: DiscountRuleType.SpentSpecificAmount,
      icon: 'solar:tag-price-bold-duotone',
      iconClass: 'bg-emerald-500/10 text-emerald-600'
    },
    {
      label: 'Has All Products',
      description: 'Customer has all of these products in cart',
      value: DiscountRuleType.HasAllProducts,
      icon: 'solar:box-minimalistic-bold-duotone',
      iconClass: 'bg-violet-500/10 text-violet-600'
    },
    {
      label: 'Has One Product',
      description: 'Customer has one of these products in cart',
      value: DiscountRuleType.HasOneofAnyProducts,
      icon: 'solar:cart-large-2-bold-duotone',
      iconClass: 'bg-orange-500/10 text-orange-600'
    },
    {
      label: 'Cart Subtotal',
      description: 'Subtotal in shopping cart x.xx',
      value: DiscountRuleType.SubtotalAmountInCart,
      icon: 'solar:bill-list-bold-duotone',
      iconClass: 'bg-rose-500/10 text-rose-600'
    }
  ])

  const selectedRequirement = computed(() => requirementCards.value.find(card => card.value === selectedRuleType.value))

  const showSpentSpecificAmount = computed(() => selectedRuleType.value === DiscountRuleType.SpentSpecificAmount)
  const showCartSubtotalAmount = computed(() => selectedRuleType.value === DiscountRuleType.SubtotalAmountInCart)
  const showProductRequirement = computed(() => [
    DiscountRuleType.HasAllProducts,
    DiscountRuleType.HasOneofAnyProducts
  ].includes(selectedRuleType.value ?? DiscountRuleType.AssignToSpecificCustomer))
  const showRequirementDetails = computed(() => showSpentSpecificAmount.value || showCartSubtotalAmount.value || showProductRequirement.value)

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

  const selectedProductIds = computed<string[]>(() => {
    const rows = selectableTable.value?.tableApi?.getFilteredSelectedRowModel().rows ?? []
    return rows.map(r => r.original.Id).filter((id): id is string => Boolean(id))
  })

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories({
        CurrentPage: 1,
        PageSize: 1000
      })

      categoryOptions.value = [
        ...((response.Items || []) as CategoryDto[]).map(c => ({ label: c.Name, value: c.Id }))
      ]
    } catch (error) {
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
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.add({ title: 'Error', description: 'Failed to load brands', color: 'error' })
    }
  }

  const fetchSelectableProducts = async () => {
    productsLoading.value = true
    rowSelection.value = {}

    try {
      const publishedId = publishedFilter.value === 'all'
        ? 0
        : publishedFilter.value === 'published'
          ? 1
          : 2

      const response = await ProductService.getProducts({
        CurrentPage: 1,
        PageSize: maxPageSize,
        SearchTerm: searchTerm.value || undefined,
        PublishedId: publishedId,
        CategoryIds: selectedCategoryIds.value.length ? selectedCategoryIds.value : undefined,
        BrandIds: selectedBrandIds.value.length ? selectedBrandIds.value : undefined
      })

      productsData.value = response
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.add({ title: 'Error', description: 'Failed to load products', color: 'error' })
    } finally {
      productsLoading.value = false
    }
  }

  const onApplyFilters = () => {
    fetchSelectableProducts()
  }

  const onImport = () => {
    toast.add({ title: 'Import', description: 'Import is not available yet', color: 'info' })
  }

  const onSaveMappings = async () => {
    if (!props.discountId || !selectedProductIds.value.length) return

    mapLoading.value = true

    try {
      await DiscountService.mapDiscountEntities({
        DiscountId: props.discountId,
        EntityType: DiscountEntityType.Product,
        EntityIds: selectedProductIds.value
      })

      toast.add({ title: 'Success', description: 'Products added to requirement', color: 'success' })
      rowSelection.value = {}
      selectedRuleType.value = null
    } catch (error) {
      console.error('Error mapping discount entities:', error)
      toast.add({ title: 'Error', description: 'Failed to add products', color: 'error' })
    } finally {
      mapLoading.value = false
    }
  }

  const clearSelection = () => {
    selectedRuleType.value = null
    rowSelection.value = {}
    productsData.value = null
  }

  const onAddRequirement = () => {
    if (showSpentSpecificAmount.value) {
      spentMinimumAmount.value = null
    }

    if (showCartSubtotalAmount.value) {
      cartSubtotalMinimumAmount.value = null
    }

    if (showProductRequirement.value) {
      onSaveMappings()
      return
    }

    selectedRuleType.value = null
  }

  watch(showProductRequirement, (value) => {
    if (!value) return
    if (!categoryOptions.value.length) {
      fetchCategories()
    }
    if (!brandOptions.value.length) {
      fetchBrands()
    }
  })
</script>
