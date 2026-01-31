<template>
  <div class="space-y-4 p-4 pb-8">
    <GenericAlert
      v-if="!discountId"
      :title="unsavedAlertTitle"
      :description="unsavedAlertDescription"
      color="warning"
      variant="soft"
    />
    <UCard
      v-else
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex gap-2 items-center">
          <Icon
            icon="solar:layers-bold-duotone"
            width="24"
            height="24"
            style="color: #00C16A"
          />
          <h3 class="text-xl font-medium">Assign To Categories</h3>
        </div>
        <UDropdownMenu
          :items="actionItems"
          :content="{ align: 'end' }"
          :ui="{ item: 'cursor-pointer' }"
          class="cursor-pointer"
        >
          <UButton
            icon="i-solar:menu-dots-bold-duotone"
            color="success"
            variant="soft"
            class="cursor-pointer"
            :disabled="!discountId"
          />
        </UDropdownMenu>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Assign this discount to specific categories</p>

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
      >
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip text="Delete">
              <UButton
                icon="i-solar:trash-bin-2-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10"
                :loading="deleteLoadingId === row.original.Id"
                :disabled="!row.original.Id || deleteLoadingId === row.original.Id"
                @click="onDeleteMapping(row.original.Id)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-4">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} categories
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="pageSize"
          :total="data?.TotalCount || 0"
        />
      </div>
    </UCard>

    <UModal
      v-model:open="addModalOpen"
      title="Add categories"
      description="Filter categories to add to this discount"
    >
      <template #body>
        <div class="space-y-4 max-h-[70vh] overflow-auto pr-2">
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Name">
              <UInput
                v-model="searchTerm"
                placeholder="Search by name..."
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
          </div>

          <div class="flex justify-end">
            <UButton
              label="Apply Filters"
              icon="solar:minimalistic-magnifer-line-duotone"
              color="primary"
              variant="solid"
              class="cursor-pointer"
              :loading="categoriesLoading"
              @click="onApplyFilters"
            />
          </div>

          <UTable
            v-if="categoriesData"
            ref="selectableTable"
            v-model:row-selection="rowSelection"
            :data="categoryTableData"
            :columns="categoryColumns"
            :loading="categoriesLoading"
            class="mt-2"
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

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              :disabled="mapLoading"
              @click="addModalOpen = false"
            />
            <UButton
              label="Save"
              color="primary"
              variant="solid"
              class="cursor-pointer"
              :disabled="selectedCategoryIds.length === 0"
              :loading="mapLoading"
              @click="onSaveMappings"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import CategoryService from '~/services/CategoryService'
  import DiscountService from '~/services/DiscountService'
  import { DiscountEntityType, type DiscountEntityDto } from '~/types/catalog/Discount'
  import type { CategoryDto } from '~/types/catalog/Category'
  import type { PagedList } from '~/types/common/PagedList'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    discountId?: string
  }>()

  type TableRow = DiscountEntityDto & { id: string }
  type CategoryRow = CategoryDto & { id: string }

  type UTableExpose = {
    tableApi?: {
      getFilteredSelectedRowModel: () => { rows: Array<{ original: CategoryRow }> }
    }
  }

  const toast = useToast()
  const UCheckbox = resolveComponent('UCheckbox')
  const selectableTable = useTemplateRef<UTableExpose | null>('selectableTable')
  const loading = ref(false)
  const data = ref<PagedList<DiscountEntityDto> | null>(null)
  const page = ref(1)
  const pageSize = ref(20)
  const unsavedAlertTitle = 'Save general information first'
  const unsavedAlertDescription = 'Save the discount general information before assigning categories.'
  const addModalOpen = ref(false)
  const categoriesLoading = ref(false)
  const categoriesData = ref<PagedList<CategoryDto> | null>(null)
  const searchTerm = ref('')
  const publishedFilter = ref<'all' | 'published' | 'unpublished'>('all')
  const rowSelection = ref<Record<string, boolean>>({})
  const mapLoading = ref(false)
  const deleteLoadingId = ref<string | null>(null)
  const maxPageSize = 1000

  const publishedItems = [
    { label: 'All', value: 'all' },
    { label: 'Only Published', value: 'published' },
    { label: 'Only Unpublished', value: 'unpublished' }
  ]

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const actionItems = computed<DropdownMenuItem[][]>(() => ([
    [
      {
        label: 'Add Category',
        icon: 'i-solar:add-circle-bold-duotone',
        disabled: !props.discountId,
        onSelect: () => {
          addModalOpen.value = true
        }
      },
      {
        label: 'Import',
        icon: 'i-solar:import-bold-duotone',
        disabled: !props.discountId,
        onSelect: () => toast.add({ title: 'Import', description: 'Import is not available yet', color: 'info' })
      }
    ]
  ]))

  const categoryTableData = computed<CategoryRow[]>(() => {
    if (!categoriesData.value?.Items) return []
    return categoriesData.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const categoryColumns = computed<TableColumn<CategoryRow>[]>(() => ([
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
    { accessorKey: 'Published', header: 'Published' }
  ]))

  const selectedCategoryIds = computed<string[]>(() => {
    const rows = selectableTable.value?.tableApi?.getFilteredSelectedRowModel().rows ?? []
    return rows.map(r => r.original.Id).filter((id): id is string => Boolean(id))
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    return [
      { accessorKey: 'EntityName', header: 'Name' },
      { id: 'actions', header: 'Actions' }
    ]
  })

  const fetchDiscountEntities = async () => {
    if (!props.discountId) return

    loading.value = true

    try {
      const response = await DiscountService.getDiscountEntities({
        DiscountId: props.discountId,
        EntityType: DiscountEntityType.Category,
        CurrentPage: page.value,
        PageSize: pageSize.value
      })

      data.value = response
    } catch (error) {
      console.error('Error fetching discount entities:', error)
      toast.add({ title: 'Error', description: 'Failed to load assigned categories', color: 'error' })
    } finally {
      loading.value = false
    }
  }

  const fetchSelectableCategories = async () => {
    categoriesLoading.value = true
    rowSelection.value = {}

    try {
      const publishedId = publishedFilter.value === 'all'
        ? 0
        : publishedFilter.value === 'published'
          ? 1
          : 2

      const response = await CategoryService.getCategories({
        CurrentPage: 1,
        PageSize: maxPageSize,
        Name: searchTerm.value || undefined,
        PublishedId: publishedId
      })

      categoriesData.value = response
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
    } finally {
      categoriesLoading.value = false
    }
  }

  const onApplyFilters = () => {
    fetchSelectableCategories()
  }

  const onSaveMappings = async () => {
    if (!props.discountId || !selectedCategoryIds.value.length) return

    mapLoading.value = true

    try {
      await DiscountService.mapDiscountEntities({
        DiscountId: props.discountId,
        EntityType: DiscountEntityType.Category,
        EntityIds: selectedCategoryIds.value
      })

      toast.add({ title: 'Success', description: 'Categories added to discount', color: 'success' })
      addModalOpen.value = false
      rowSelection.value = {}
      await fetchDiscountEntities()
    } catch (error) {
      console.error('Error mapping discount entities:', error)
      toast.add({ title: 'Error', description: 'Failed to add categories', color: 'error' })
    } finally {
      mapLoading.value = false
    }
  }

  const onDeleteMapping = async (mappingId?: string) => {
    if (!mappingId) return

    deleteLoadingId.value = mappingId

    try {
      await DiscountService.deleteDiscountEntity(mappingId)
      toast.add({ title: 'Deleted', description: 'Category removed from discount', color: 'success' })
      await fetchDiscountEntities()
    }
    catch (error) {
      console.error('Error deleting discount entity:', error)
      toast.add({ title: 'Error', description: 'Failed to remove category', color: 'error' })
    }
    finally {
      deleteLoadingId.value = null
    }
  }

  watch(() => props.discountId, (value) => {
    if (!value) {
      data.value = null
      return
    }
    page.value = 1
    fetchDiscountEntities()
  }, { immediate: true })

  watch([page, pageSize], () => {
    if (props.discountId) {
      fetchDiscountEntities()
    }
  })
</script>