<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Specification Attributes">
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
              class="cursor-pointer rounded-lg px-2"
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
        <template #AllowFiltering-cell="{ row }">
          <UIcon
            :name="row.original.AllowFiltering ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
            :class="`size-5 ${row.original.AllowFiltering ? 'text-primary' : 'text-red-500'}`"
          />
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} specification attributes
        </div>

        <div class="flex items-center gap-1.5">
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
        v-model:open="upsertModalOpen"
        :title="upsertState.Id ? 'Edit specification attribute' : 'Create specification attribute'"
        description="Set the specification attribute details."
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

            <UFormField
              label="Attribute Type"
              name="AttributeType"
              required
            >
              <USelectMenu
                v-model="selectedAttributeType"
                :items="attributeTypeOptions"
                placeholder="Select type"
                value-key="value"
                label-key="label"
                class="w-full"
                size="lg"
              />
            </UFormField>

            <UFormField
              label="Allow Filtering"
              name="AllowFiltering"
              class="flex items-center justify-between gap-2"
            >
              <USwitch v-model="upsertState.AllowFiltering" :ui="{ base: 'cursor-pointer' }" />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="subtle"
                class="cursor-pointer rounded-lg px-3"
                :disabled="upsertLoading"
                @click="upsertModalOpen = false"
              />
              <UButton
                :label="upsertState.Id ? 'Save' : 'Create'"
                color="primary"
                variant="solid"
                class="cursor-pointer rounded-lg px-3"
                :loading="upsertLoading"
                type="submit"
              />
            </div>
          </UForm>
        </template>
      </UModal>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete specification attribute"
        description="This action cannot be undone."
      >
        <template #body>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer rounded-lg px-3"
              :disabled="deleteLoading"
              @click="deleteModalOpen = false"
            />
            <UButton
              label="Delete"
              color="error"
              variant="solid"
              class="cursor-pointer rounded-lg px-3"
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
  import SpecificationAttributeService from '~/services/SpecificationAttributeService'
  import { SpecificationAttributeType, type SpecificationAttributeDto, type UpsertSpecificationAttributeDto } from '~/types/catalog/SpecificationAttribute'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = SpecificationAttributeDto & { id: string, AttributeTypeLabel: string }
  type SelectOption = { label: string, value: string }

  const toast = useToast()
  const { hasPermission } = useSitemap()

  const page = ref(1)
  const pageSize = ref(20)
  const nameFilter = ref('')
  const pageSizeOptions = [
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ]

  const canCreate = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Edit))
  const canDelete = computed(() => hasPermission(PermissionSystemName.Products, PermissionActionName.Delete))

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Specification Attribute',
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

  const attributeTypeLabel = (type: SpecificationAttributeType) => {
    if (type === SpecificationAttributeType.HtmlText) return 'Html Text'
    if (type === SpecificationAttributeType.Hyperlink) return 'Hyperlink'
    return 'Text'
  }

  const columns = computed<TableColumn<TableRow>[]>(() => {
    const cols: TableColumn<TableRow>[] = [
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'AttributeTypeLabel', header: 'Type' },
      { accessorKey: 'AllowFiltering', header: 'Filterable' }
    ]

    if (canEdit.value || canDelete.value) {
      cols.push({ id: 'actions', header: 'Actions' })
    }

    return cols
  })

  const loading = ref(false)
  const data = ref<PagedList<SpecificationAttributeDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({
      ...item,
      id: item.Id,
      AttributeTypeLabel: attributeTypeLabel(item.AttributeType)
    }))
  })

  const fetchSpecificationAttributes = async () => {
    loading.value = true

    try {
      const response = await SpecificationAttributeService.getSpecificationAttributes({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        Name: nameFilter.value || undefined
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching specification attributes:', error)
      toast.add({ title: 'Error', description: 'Failed to load specification attributes', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchSpecificationAttributes()
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
    fetchSpecificationAttributes()
  })

  onMounted(() => {
    fetchSpecificationAttributes()
  })

  const upsertModalOpen = ref(false)
  const upsertLoading = ref(false)

  const upsertState = reactive<UpsertSpecificationAttributeDto>({
    Id: undefined,
    Name: '',
    AttributeType: SpecificationAttributeType.Text,
    AllowFiltering: false
  })

  const upsertSchema = z.object({
    Name: z.string().min(1, 'Name is required'),
    AttributeType: z.coerce.number(),
    AllowFiltering: z.boolean()
  })

  const attributeTypeOptions = ref<SelectOption[]>([
    { label: 'Text', value: String(SpecificationAttributeType.Text) },
    { label: 'Html Text', value: String(SpecificationAttributeType.HtmlText) },
    { label: 'Hyperlink', value: String(SpecificationAttributeType.Hyperlink) }
  ])

  const selectedAttributeType = computed<string>({
    get: () => String(upsertState.AttributeType),
    set: (val) => {
      upsertState.AttributeType = Number(val)
    }
  })

  function openCreateModal() {
    upsertState.Id = undefined
    upsertState.Name = ''
    upsertState.AttributeType = SpecificationAttributeType.Text
    upsertState.AllowFiltering = false
    upsertModalOpen.value = true
  }

  function openEditModal(attribute: SpecificationAttributeDto) {
    if (!canEdit.value) return
    upsertState.Id = attribute.Id
    upsertState.Name = attribute.Name
    upsertState.AttributeType = attribute.AttributeType
    upsertState.AllowFiltering = attribute.AllowFiltering ?? false
    upsertModalOpen.value = true
  }

  async function onUpsertSubmit() {
    upsertLoading.value = true
    try {
      await SpecificationAttributeService.upsertSpecificationAttribute({
        Id: upsertState.Id,
        Name: upsertState.Name,
        AttributeType: upsertState.AttributeType,
        AllowFiltering: upsertState.AllowFiltering
      })
      toast.add({ title: 'Success', description: 'Specification attribute saved successfully', color: 'success' })
      upsertModalOpen.value = false
      await fetchSpecificationAttributes()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save specification attribute', color: 'error' })
    }
    finally {
      upsertLoading.value = false
    }
  }

  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteTarget = ref<SpecificationAttributeDto | null>(null)

  function openDeleteModal(attribute: SpecificationAttributeDto) {
    if (!canDelete.value) return
    deleteTarget.value = attribute
    deleteModalOpen.value = true
  }

  async function onDelete() {
    const target = deleteTarget.value
    if (!target?.Id) return

    deleteLoading.value = true
    try {
      await SpecificationAttributeService.deleteSpecificationAttribute(target.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Specification attribute deleted successfully', color: 'success' })
      await fetchSpecificationAttributes()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete specification attribute', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
