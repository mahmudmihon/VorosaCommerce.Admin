<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Product Tags">
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
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip text="Edit">
              <UButton
                icon="i-solar:pen-new-square-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
                :disabled="!row.original.Id"
                @click="openEditModal(row.original)"
              />
            </UTooltip>

            <UTooltip text="Delete">
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
          Total {{ data?.TotalCount || 0 }} product tags
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            v-model:page="page"
            :items-per-page="pageSize"
            :total="data?.TotalCount || 0"
          />
        </div>
      </div>

      <UModal
        v-model:open="upsertModalOpen"
        :title="upsertState.Id ? 'Edit product tag' : 'Create product tag'"
        description="Set the product tag name."
      >
        <template #body>
          <UForm
            :schema="upsertSchema"
            :state="upsertState"
            class="space-y-4"
            @submit="onUpsertSubmit"
          >
            <UFormField
              label="Name"
              name="Name"
              required
            >
              <UInput
                v-model="upsertState.Name"
                size="lg"
                placeholder="Enter tag name"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="subtle"
                class="cursor-pointer"
                :disabled="upsertLoading"
                @click="upsertModalOpen = false"
              />
              <UButton
                :label="upsertState.Id ? 'Save' : 'Create'"
                color="primary"
                variant="solid"
                class="cursor-pointer"
                :loading="upsertLoading"
                type="submit"
              />
            </div>
          </UForm>
        </template>
      </UModal>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete product tag"
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
  import * as z from 'zod'
  import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
  import { useDebounceFn } from '@vueuse/core'
  import ProductTagService from '~/services/ProductTagService'
  import type { ProductTagDto, UpsertProductTagDto } from '~/types/catalog/ProductTag'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = ProductTagDto & { id: string }

  const toast = useToast()
  const { hasPermission } = useSitemap()

  const page = ref(1)
  const pageSize = ref(20)
  const nameFilter = ref('')

  const canCreate = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Edit))
  const canDelete = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Delete))

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Product Tag',
        icon: 'i-solar:add-circle-bold-duotone',
        onSelect: () => {
          openCreateModal()
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
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'Count', header: 'Product Count' }
    ]

    if (canEdit.value || canDelete.value) {
      cols.push({ id: 'actions', header: 'Actions' })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<ProductTagDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const fetchProductTags = async () => {
    loading.value = true

    try {
      const response = await ProductTagService.getProductTags({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        Name: nameFilter.value || undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching product tags:', error)
      toast.add({ title: 'Error', description: 'Failed to load product tags', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchProductTags()
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
    fetchProductTags()
  })

  onMounted(() => {
    fetchProductTags()
  })

  const upsertModalOpen = ref(false)
  const upsertLoading = ref(false)

  const upsertState = reactive<UpsertProductTagDto>({
    Id: undefined,
    Name: ''
  })

  const upsertSchema = z.object({
    Name: z.string().min(1, 'Name is required')
  })

  function openCreateModal() {
    upsertState.Id = undefined
    upsertState.Name = ''
    upsertModalOpen.value = true
  }

  function openEditModal(tag: ProductTagDto) {
    if (!canEdit.value) return
    upsertState.Id = tag.Id
    upsertState.Name = tag.Name
    upsertModalOpen.value = true
  }

  async function onUpsertSubmit() {
    upsertLoading.value = true
    try {
      await ProductTagService.upsertProductTag({ Id: upsertState.Id, Name: upsertState.Name })
      toast.add({ title: 'Success', description: 'Product tag saved successfully', color: 'success' })
      upsertModalOpen.value = false
      await fetchProductTags()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save product tag', color: 'error' })
    }
    finally {
      upsertLoading.value = false
    }
  }

  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteTarget = ref<ProductTagDto | null>(null)

  function openDeleteModal(tag: ProductTagDto) {
    if (!canDelete.value) return
    deleteTarget.value = tag
    deleteModalOpen.value = true
  }

  async function onDelete() {
    const target = deleteTarget.value
    if (!target?.Id) return

    deleteLoading.value = true
    try {
      await ProductTagService.deleteProductTag(target.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Product tag deleted successfully', color: 'success' })
      await fetchProductTags()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete product tag', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
