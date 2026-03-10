<template>
  <UCard
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
        <h3 class="text-xl font-medium">{{ title }}</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
        @click="addModalOpen = true"
      >
        Map Categories
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">{{ description }}</p>

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

    <UModal v-model:open="addModalOpen" title="Add Categories" :ui="{ content: 'w-full sm:max-w-5xl' }">
      <template #body>
        <div class="space-y-4">
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

          <div class="flex justify-end gap-2">
            <UButton
              label="Search"
              icon="solar:minimalistic-magnifer-line-duotone"
              color="primary"
              variant="solid"
              class="cursor-pointer rounded-lg px-3"
              :loading="categoriesLoading"
              @click="onApplyFilters"
            />

            <UButton
              label="Import"
              icon="i-solar:import-bold-duotone"
              color="secondary"
              variant="soft"
              class="cursor-pointer rounded-lg px-3"
              @click="onImport"
            />
          </div>

          <div class="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 my-10 h-50 overflow-auto">
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-medium">Selected Categories</div>
              <UButton
                v-if="selectedCategories.length"
                label="Add Categories"
                icon="i-solar:add-circle-bold-duotone"
                color="primary"
                variant="outline"
                class="cursor-pointer rounded-lg px-3"
                :loading="mapLoading"
                @click="onAddCategories"
              />
            </div>
            <div v-if="selectedCategories.length" class="mt-3 flex flex-wrap gap-2">
              <UBadge
                v-for="category in selectedCategories"
                :key="category.Id"
                color="neutral"
                variant="subtle"
                class="flex items-center gap-1 pr-1"
              >
                <span>{{ category.Name }}</span>
                <UButton
                  icon="i-solar:close-circle-bold-duotone"
                  variant="ghost"
                  color="error"
                  size="xs"
                  class="cursor-pointer"
                  @click="removeSelectedCategory(category.Id)"
                />
              </UBadge>
            </div>
            <div v-else class="mt-2 text-sm text-muted-foreground">
              No categories selected.
            </div>
          </div>

          <div v-if="!categoriesRequested" class="text-sm text-muted-foreground">
            Apply filters to view categories.
          </div>

          <div v-else class="space-y-4">
            <UTable
              ref="selectableTable"
              v-model:row-selection="rowSelection"
              :data="categoryTableData"
              :columns="categoryColumns"
              :get-row-id="getRowId"
              :loading="categoriesLoading"
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
                Total {{ categoriesData?.TotalCount || 0 }} categories
              </div>

              <div class="flex items-center gap-1.5">
                <UTooltip text="Refresh">
                  <UButton
                    class="cursor-pointer"
                    icon="i-solar:refresh-bold-duotone"
                    color="neutral"
                    variant="outline"
                    :loading="categoriesLoading"
                    square
                    @click="fetchSelectableCategories"
                  />
                </UTooltip>
                <UPagination
                  v-model:page="page"
                  :items-per-page="pageSize"
                  :total="categoriesData?.TotalCount || 0"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer rounded-lg px-3"
              @click="addModalOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="editModalOpen" title="Edit Category" :ui="{ content: 'w-full sm:max-w-3xl' }">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Category">
            <UInput
              :model-value="editingCategory?.Name || ''"
              disabled
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Use Default Category Image"
            name="UseDefaultImage"
            class="flex items-center justify-between gap-2"
          >
            <USwitch v-model="editUseDefaultImage" :ui="{ base: 'cursor-pointer' }" />
          </UFormField>

          <div
            v-if="editImageUrl && !editUseDefaultImage"
            class="relative flex flex-col gap-3 rounded-2xl border border-default bg-elevated/25 p-3 min-h-48"
          >
            <UButton
              type="button"
              icon="i-solar:trash-bin-minimalistic-bold-duotone"
              color="error"
              variant="ghost"
              size="md"
              square
              class="absolute right-2 top-2 z-10"
              aria-label="Remove image"
              @click="onRemoveEditImage"
            />
            <div class="flex-1 flex items-center justify-center">
              <img
                :src="editImageUrl"
                alt="Category image"
                class="max-h-44 w-auto object-contain"
              >
            </div>
          </div>

          <UFileUpload
            v-else-if="!editUseDefaultImage"
            v-model="editImageFile"
            layout="list"
            label="Category image"
            description="SVG, PNG, JPG or GIF (max. 5MB)"
            accept=".svg,.png,.jpg,.jpeg,.gif"
            class="w-full min-h-48"
          />

          <UFormField label="Display Order" name="DisplayOrder">
            <UInput
              v-model="editDisplayOrder"
              size="xl"
              type="number"
              :min="0"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer rounded-lg px-3"
              :disabled="editLoading"
              @click="editModalOpen = false"
            />
            <UButton
              label="Save"
              color="primary"
              variant="solid"
              class="cursor-pointer rounded-lg px-3"
              :loading="editLoading"
              @click="onUpdateHomepageCategory"
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
import type { CategoryDto } from '~/types/catalog/Category'
import type { HomepageCategoryDto } from '~/types/homepagetemplate/HomepageCategory'
import HomepageCategoryService from '~/services/HomepageCategoryService'
import CategoryService from '~/services/CategoryService'

const props = withDefaults(defineProps<{
  templateId: string
  title?: string
  description?: string
}>(), {
  title: 'Categories',
  description: 'Map this template to categories'
})

type CategoryRow = CategoryDto & { id: string }
type HomepageRow = HomepageCategoryDto & { id: string }

type UTableExpose = {
  tableApi?: {
    getFilteredSelectedRowModel: () => { rows: Array<{ original: CategoryRow }> }
  }
}

const toast = useToast()
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const selectableTable = useTemplateRef<UTableExpose | null>('selectableTable')

const homepageCategories = ref<HomepageCategoryDto[]>([])
const loading = ref(false)
const addModalOpen = ref(false)
const mapLoading = ref(false)
const editModalOpen = ref(false)
const editLoading = ref(false)
const deleteLoadingId = ref<string | null>(null)
const editingCategory = ref<HomepageCategoryDto | null>(null)
const editDisplayOrder = ref(0)
const editUseDefaultImage = ref(true)
const editImageUrl = ref<string | null>(null)
const editImageFile = ref<File | undefined>(undefined)

const categoriesLoading = ref(false)
const categoriesData = ref<PagedList<CategoryDto> | null>(null)
const rowSelection = ref<Record<string, boolean>>({})
const categoriesRequested = ref(false)
const page = ref(1)
const pageSize = ref(20)
const selectedCategoryMap = ref<Record<string, CategoryDto>>({})

const searchTerm = ref('')
const publishedFilter = ref<'all' | 'published' | 'unpublished'>('all')

const publishedItems = [
  { label: 'All', value: 'all' },
  { label: 'Only Published', value: 'published' },
  { label: 'Only Unpublished', value: 'unpublished' }
]

const tableData = computed<HomepageRow[]>(() => {
  return homepageCategories.value.map(item => ({ ...item, id: item.Id }))
})

const columns = computed<TableColumn<HomepageRow>[]>(() => ([
  { accessorKey: 'Name', header: 'Name' },
  { accessorKey: 'DisplayOrder', header: 'Display Order' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(UButton, {
          icon: 'i-solar:pen-new-square-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10',
          onClick: () => openEditModal(row.original)
        }),
        h(UButton, {
          icon: 'i-solar:trash-bin-2-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10',
          loading: deleteLoadingId.value === row.original.Id,
          disabled: deleteLoadingId.value === row.original.Id,
          onClick: () => onDelete(row.original.Id)
        })
      ])
  }
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

const selectedCategories = computed<CategoryDto[]>(() => {
  return Object.values(selectedCategoryMap.value).sort((a, b) => a.Name.localeCompare(b.Name))
})

const selectedCategoryIds = computed<string[]>(() => {
  return Object.keys(selectedCategoryMap.value)
})

const fetchHomepageCategories = async () => {
  if (!props.templateId) return

  loading.value = true
  try {
    homepageCategories.value = await HomepageCategoryService.getHomepageCategories(props.templateId)
  }
  catch (error) {
    console.error('Failed to fetch homepage categories', error)
    toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const fetchSelectableCategories = async () => {
  categoriesLoading.value = true

  try {
    const publishedId = publishedFilter.value === 'all'
      ? 0
      : publishedFilter.value === 'published'
        ? 1
        : 2

    const response = await CategoryService.getCategories({
      CurrentPage: page.value,
      PageSize: pageSize.value,
      Name: searchTerm.value || undefined,
      PublishedId: publishedId
    })

    categoriesData.value = response
  }
  catch (error) {
    console.error('Error fetching categories:', error)
    toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
  }
  finally {
    categoriesLoading.value = false
  }
}

const onApplyFilters = () => {
  page.value = 1
  categoriesRequested.value = true
  fetchSelectableCategories()
}

const onImport = () => {
  toast.add({ title: 'Import', description: 'Import is not available yet', color: 'info' })
}

const onAddCategories = async () => {
  if (!selectedCategoryIds.value.length) return

  mapLoading.value = true

  try {
    await HomepageCategoryService.mapHomepageCategories({
      TemplateId: props.templateId,
      CategoryIds: selectedCategoryIds.value
    })
    toast.add({ title: 'Success', description: 'Categories added successfully', color: 'success' })
    addModalOpen.value = false
    rowSelection.value = {}
    selectedCategoryMap.value = {}
    await fetchHomepageCategories()
  }
  catch (error) {
    console.error('Error adding categories:', error)
    toast.add({ title: 'Error', description: 'Failed to add categories', color: 'error' })
  }
  finally {
    mapLoading.value = false
  }
}

const openEditModal = (item: HomepageCategoryDto) => {
  editingCategory.value = item
  editDisplayOrder.value = item.DisplayOrder
  editImageUrl.value = item.ImageUrl ?? null
  editUseDefaultImage.value = !item.ImageUrl
  editImageFile.value = undefined
  editModalOpen.value = true
}

const onRemoveEditImage = () => {
  editImageUrl.value = null
  editImageFile.value = undefined
  editUseDefaultImage.value = true
}

const onUpdateHomepageCategory = async () => {
  if (!props.templateId || !editingCategory.value) return
  editLoading.value = true
  try {
    const payload = new FormData()
    payload.append('Id', editingCategory.value.Id)
    payload.append('TemplateId', props.templateId)
    payload.append('CategoryId', editingCategory.value.CategoryId)
    payload.append('DisplayOrder', editDisplayOrder.value.toString())
    payload.append('UseDefaultImage', editUseDefaultImage.value.toString())
    if (!editUseDefaultImage.value && editImageFile.value) {
      payload.append('ImageFile', editImageFile.value)
    }

    await HomepageCategoryService.updateHomepageCategory(payload)
    toast.add({ title: 'Success', description: 'Category updated successfully', color: 'success' })
    editModalOpen.value = false
    await fetchHomepageCategories()
  }
  catch (error) {
    console.error('Error updating homepage category', error)
    toast.add({ title: 'Error', description: 'Failed to update category', color: 'error' })
  }
  finally {
    editLoading.value = false
  }
}

const onDelete = async (id: string) => {
  if (!id || deleteLoadingId.value) return
  deleteLoadingId.value = id
  try {
    await HomepageCategoryService.deleteHomepageCategory(id)
    toast.add({ title: 'Success', description: 'Category removed successfully', color: 'success' })
    await fetchHomepageCategories()
  }
  catch (error) {
    console.error('Error deleting homepage category', error)
    toast.add({ title: 'Error', description: 'Failed to remove category', color: 'error' })
  }
  finally {
    deleteLoadingId.value = null
  }
}

onMounted(() => {
  fetchHomepageCategories()
})

watch(addModalOpen, (value) => {
  if (!value) return
  categoriesRequested.value = false
  categoriesData.value = null
  rowSelection.value = {}
  selectedCategoryMap.value = {}
  page.value = 1
})

watch([page, pageSize], () => {
  if (!categoriesRequested.value) return
  fetchSelectableCategories()
})

const syncRowSelection = () => {
  const selection: Record<string, boolean> = {}
  for (const item of categoryTableData.value) {
    if (selectedCategoryMap.value[item.Id]) {
      selection[item.id] = true
    }
  }
  rowSelection.value = selection
}

const updateSelectedFromPage = () => {
  const pageIds = new Set(categoryTableData.value.map(item => item.Id))
  const nextMap = Object.fromEntries(
    Object.entries(selectedCategoryMap.value).filter(([id]) => !pageIds.has(id))
  ) as Record<string, CategoryDto>

  for (const item of categoryTableData.value) {
    if (rowSelection.value[item.id]) {
      nextMap[item.Id] = item
    }
  }

  selectedCategoryMap.value = nextMap
}

watch(categoryTableData, () => {
  if (!categoriesRequested.value) return
  syncRowSelection()
})

watch(rowSelection, () => {
  if (!categoriesRequested.value) return
  updateSelectedFromPage()
}, { deep: true })

const getRowId = (row: CategoryRow) => row.Id

const removeSelectedCategory = (id: string) => {
  const { [id]: _removed, ...rest } = selectedCategoryMap.value
  selectedCategoryMap.value = rest
  const { [id]: _selection, ...nextSelection } = rowSelection.value
  rowSelection.value = nextSelection
}
</script>