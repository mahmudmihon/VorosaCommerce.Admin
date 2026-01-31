<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Discounts">
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
              <UFormField label="Name">
                <UInput
                  v-model="nameFilter"
                  placeholder="Search by name..."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Discount Type">
                <USelect
                  v-model="discountTypeFilter"
                  :items="discountTypeOptions"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                  placeholder="Select"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Enabled">
                <USelect
                  v-model="enabledFilter"
                  :items="enabledOptions"
                  :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                  placeholder="Select"
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
        <template #type-cell="{ row }">
          <span class="text-sm font-semibold">
            {{ discountTypeLabel(row.original.DiscountType) }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UIcon
            :name="row.original.IsEnabled ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
            :class="row.original.IsEnabled ? 'text-primary' : 'text-red-500'"
            class="size-5"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip v-if="canEdit" text="Edit">
              <UButton
                icon="i-solar:pen-new-square-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
                :to="row.original.Id ? `/discount/edit/${row.original.Id}` : undefined"
                :disabled="!row.original.Id"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ data?.TotalCount || 0 }} discounts
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
              @click="fetchDiscounts"
            />
          </UTooltip>
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
  import DiscountService from '~/services/DiscountService'
  import { DiscountType, type DiscountDto } from '~/types/catalog/Discount'
  import type { PagedList } from '~/types/common/PagedList'
  import { PermissionActionName, PermissionSystemName } from '~/types/identity/permissions'

  type TableRow = DiscountDto & { id: string }

  const toast = useToast()
  const { hasPermission } = useSitemap()

  const page = ref(1)
  const pageSize = ref(20)
  const nameFilter = ref('')
  const discountTypeFilter = ref(0)
  const enabledFilter = ref(0)
  const loading = ref(false)

  const canCreate = computed(() => hasPermission(PermissionSystemName.Discounts, PermissionActionName.Create))
  const canEdit = computed(() => hasPermission(PermissionSystemName.Discounts, PermissionActionName.Edit))
  const canExport = computed(() => hasPermission(PermissionSystemName.Discounts, PermissionActionName.Export))
  const canImport = computed(() => hasPermission(PermissionSystemName.Discounts, PermissionActionName.Import))

  const discountTypeOptions = computed(() => {
    const values = Object.values(DiscountType).filter((value): value is number => typeof value === 'number')
    return [
      { label: 'All', value: 0 },
      ...values.map(value => ({
        label: splitTitleCase(DiscountType[value] ?? String(value)),
        value
      }))
    ]
  })

  const enabledOptions = [
    { label: 'All', value: 0 },
    { label: 'Enabled', value: 1 },
    { label: 'Not Enabled', value: 2 }
  ]

  const headerActions = computed<DropdownMenuItem[][]>(() => {
    const actions: DropdownMenuItem[] = []

    if (canCreate.value) {
      actions.push({
        label: 'Add Discount',
        icon: 'i-solar:add-circle-bold-duotone',
        to: '/discount/create'
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

  const hasHeaderActions = computed(() => {
    return headerActions.value.some(group => group.length > 0)
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    const cols: TableColumn<TableRow>[] = [
      { accessorKey: 'Name', header: 'Name' },
      { id: 'type', header: 'Discount Type' },
      { id: 'status', header: 'Enabled' }
    ]

    if (canEdit.value) {
      cols.push({ id: 'actions', header: 'Edit' })
    }

    return cols
  })

  const data = ref<PagedList<DiscountDto> | null>(null)

  const tableData = computed<TableRow[]>(() => {
    if (!data.value?.Items) return []
    return data.value.Items.map(item => ({ ...item, id: item.Id }))
  })

  const splitTitleCase = (value: string) => {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim()
  }

  const discountTypeLabel = (type: DiscountType) => {
    return splitTitleCase(DiscountType[type] ?? String(type))
  }

  const onSearch = () => {
    if (page.value !== 1) {
      page.value = 1
      return
    }

    fetchDiscounts()
  }

  const fetchDiscounts = async () => {
    loading.value = true

    try {
      const response = await DiscountService.getDiscounts({
        CurrentPage: page.value,
        PageSize: pageSize.value,
        Name: nameFilter.value || undefined,
        DiscountTypeId: discountTypeFilter.value,
        EnabledId: enabledFilter.value
      })

      data.value = response
    }
    catch (error) {
      console.error('Error fetching discounts:', error)
      toast.add({ title: 'Error', description: 'Failed to load discounts', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(() => {
    fetchDiscounts()
  }, 500)

  watch([nameFilter, discountTypeFilter, enabledFilter], () => {
    if (page.value !== 1) {
      page.value = 1
    } else {
      debouncedFetch()
    }
  })

  watch([page, pageSize], () => {
    fetchDiscounts()
  })

  onMounted(() => {
    fetchDiscounts()
  })
</script>
