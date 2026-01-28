<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Product Attributes">
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
          Total {{ data?.TotalCount || 0 }} product attributes
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
        :title="upsertState.Id ? 'Edit product attribute' : 'Create product attribute'"
        description="Set the product attribute name."
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
                placeholder="Enter attribute name"
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
        title="Delete product attribute"
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
  import ProductAttributeService from '~/services/ProductAttributeService'
  import type { ProductAttributeDto, UpsertProductAttributeDto } from '~/types/catalog/ProductAttribute'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = ProductAttributeDto & { id: string }

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
        label: 'Add Product Attribute',
        icon: 'i-solar:add-circle-bold-duotone',
        onSelect: () => {
          openCreateModal()
        }
      })
    }

    return [actions]
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    const cols: TableColumn<TableRow>[] = [
      { accessorKey: 'Name', header: 'Name' }
    ]

    if (canEdit.value || canDelete.value) {
      cols.push({ id: 'actions', header: 'Actions' })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<ProductAttributeDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const fetchProductAttributes = async () => {
    loading.value = true

    try {
      const response = await ProductAttributeService.getProductAttributes({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        Name: nameFilter.value || undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching product attributes:', error)
      toast.add({ title: 'Error', description: 'Failed to load product attributes', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchProductAttributes()
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
    fetchProductAttributes()
  })

  onMounted(() => {
    fetchProductAttributes()
  })

  const upsertModalOpen = ref(false)
  const upsertLoading = ref(false)

  const upsertState = reactive<UpsertProductAttributeDto>({
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

  function openEditModal(attribute: ProductAttributeDto) {
    if (!canEdit.value) return
    upsertState.Id = attribute.Id
    upsertState.Name = attribute.Name
    upsertModalOpen.value = true
  }

  async function onUpsertSubmit() {
    upsertLoading.value = true
    try {
      await ProductAttributeService.upsertProductAttribute({ Id: upsertState.Id, Name: upsertState.Name })
      toast.add({ title: 'Success', description: 'Product attribute saved successfully', color: 'success' })
      upsertModalOpen.value = false
      await fetchProductAttributes()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save product attribute', color: 'error' })
    }
    finally {
      upsertLoading.value = false
    }
  }

  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteTarget = ref<ProductAttributeDto | null>(null)

  function openDeleteModal(attribute: ProductAttributeDto) {
    if (!canDelete.value) return
    deleteTarget.value = attribute
    deleteModalOpen.value = true
  }

  async function onDelete() {
    const target = deleteTarget.value
    if (!target?.Id) return

    deleteLoading.value = true
    try {
      await ProductAttributeService.deleteProductAttribute(target.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Product attribute deleted successfully', color: 'success' })
      await fetchProductAttributes()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete product attribute', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
