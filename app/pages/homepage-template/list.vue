<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Homepage Templates">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Add Template"
            icon="i-solar:add-circle-bold-duotone"
            to="/homepage-template/create"
            class="cursor-pointer rounded-lg px-3"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :data="tableData"
        :columns="columns"
        :loading="pending"
        class="w-full"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default font-semibold',
          separator: 'h-0'
        }"
      >
        <template #IsDefault-cell="{ row }">
          <UIcon
            :name="row.original.IsDefault ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone'"
            class="w-5 h-5"
            :class="row.original.IsDefault ? 'text-green-500' : 'text-red-500'"
          />
        </template>

        <template #StartDate-cell="{ row }">
           {{ row.original.StartDate ? new Date(row.original.StartDate).toLocaleDateString() : '-' }}
        </template>

        <template #EndDate-cell="{ row }">
           {{ row.original.EndDate ? new Date(row.original.EndDate).toLocaleDateString() : '-' }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-solar:pen-new-square-bold-duotone"
              variant="ghost"
              color="neutral"
              class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
              :to="row.original.Id ? `/homepage-template/edit/${row.original.Id}` : undefined"
            />
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import HomepageTemplateService from '~/services/HomepageTemplateService'
  import type { HomepageTemplateDto } from '~/types/homepagetemplate/HomepageTemplate'

  type TableRow = HomepageTemplateDto & { id: string }

  const columns: TableColumn<TableRow>[] = [
    { accessorKey: 'Name', header: 'Name' },
    { accessorKey: 'IsDefault', header: 'Is Default' },
    { accessorKey: 'StartDate', header: 'Start Date' },
    { accessorKey: 'EndDate', header: 'End Date' },
    { id: 'actions', header: 'Actions' }
  ]

  const { data, pending } = await useAsyncData<HomepageTemplateDto[]>('homepage-templates', () => HomepageTemplateService.getHomepageTemplates())

  const tableData = computed<TableRow[]>(() => {
    if (!data.value) return []
    return data.value.map(item => ({
      ...item,
      id: item.Id
    }))
  })
</script>
