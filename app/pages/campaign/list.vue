<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Campaigns">
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
          <UForm class="w-full pt-5 pb-10" @submit="onSearch">
            <div class="grid w-full gap-4 sm:grid-cols-2">
              <UFormField label="Name" class="w-full">
                <UInput
                  v-model="nameFilter"
                  placeholder="Search by name..."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Type" class="w-full">
                <USelect
                  v-model="typeFilter"
                  :items="typeOptions"
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
        :data="tableData"
        :columns="columns"
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
        <template #Type-cell="{ row }">
          {{ campaignTypeLabel(row.original.Type) }}
        </template>

        <template #ScheduledOn-cell="{ row }">
          {{ formatLocalDate(row.original.ScheduledOn) }}
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ tableData.length }} campaigns
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

  enum CampaignType {
    Email = 10,
    Sms = 20
  }

  type CampaignRow = {
    Id: string
    Name: string
    Type: CampaignType
    ScheduledOn: string
  }

  const nameFilter = ref('')
  const typeFilter = ref<'all' | CampaignType>('all')
  const appliedNameFilter = ref('')
  const appliedTypeFilter = ref<'all' | CampaignType>('all')

  const typeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Email', value: CampaignType.Email },
    { label: 'SMS', value: CampaignType.Sms }
  ]

  const campaigns = ref<CampaignRow[]>([])

  const headerActions = computed<DropdownMenuItem[][]>(() => ([
    [
      {
        label: 'Add Campaign',
        icon: 'i-solar:add-circle-bold-duotone',
        to: '/campaign/create'
      }
    ]
  ]))

  const hasHeaderActions = computed(() => {
    return headerActions.value.some(group => group.length > 0)
  })

  const columns = computed<TableColumn<CampaignRow>[]>(() => ([
    { accessorKey: 'Name', header: 'Name' },
    { accessorKey: 'Type', header: 'Type' },
    { accessorKey: 'ScheduledOn', header: 'Scheduled On' }
  ]))

  const campaignTypeLabel = (type: CampaignType) => {
    switch (type) {
      case CampaignType.Email:
        return 'Email'
      case CampaignType.Sms:
        return 'SMS'
      default:
        return 'Unknown'
    }
  }

  const formatLocalDate = (utcDate: string) => new Date(utcDate).toLocaleString()

  const tableData = computed<CampaignRow[]>(() => {
    const name = appliedNameFilter.value.trim().toLowerCase()
    const type = appliedTypeFilter.value

    return campaigns.value.filter((campaign) => {
      const matchesName = !name || campaign.Name.toLowerCase().includes(name)
      const matchesType = type === 'all' || campaign.Type === type
      return matchesName && matchesType
    })
  })

  const onSearch = () => {
    appliedNameFilter.value = nameFilter.value
    appliedTypeFilter.value = typeFilter.value
  }
</script>
