<template>
  <div class="space-y-4 p-4 pb-8">
    <GenericAlert
      v-if="!campaignId"
      title="Save campaign info first"
      description="Complete the campaign info to unlock recipients."
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
            icon="solar:users-group-rounded-bold-duotone"
            width="24"
            height="24"
            style="color: #00C16A"
          />
          <h3 class="text-xl font-medium">Recipients</h3>
        </div>
        <UButton
          label="Import"
          icon="i-solar:import-bold-duotone"
          color="secondary"
          variant="soft"
          class="cursor-pointer"
        />
      </div>
      <p class="text-sm text-muted-foreground mt-2">Manage recipients for this campaign</p>

      <UTable
        :data="tableData"
        :columns="columns"
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
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import type { TableColumn } from '#ui/types'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    campaignId?: string
  }>()

  type TableRow = {
    id: string
    Recipients: string
  }

  const recipients = ref<string[]>([])

  const tableData = computed<TableRow[]>(() => {
    return recipients.value.map((recipient, index) => ({
      id: `${index}`,
      Recipients: recipient
    }))
  })

  const columns = computed<TableColumn<TableRow>[]>(() => ([
    { accessorKey: 'Recipients', header: 'Recipients' }
  ]))

  const campaignId = computed(() => props.campaignId)
</script>
