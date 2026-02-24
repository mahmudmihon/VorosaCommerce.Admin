<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <div class="sticky top-0 z-10 flex justify-end gap-3 bg-default py-2">
      <UButton
        icon="solar:diskette-bold-duotone"
        size="md"
        color="primary"
        variant="solid"
        class="cursor-pointer"
        @click="onInfoSubmit"
      >
        Save
      </UButton>
    </div>
    <UTabs
      v-model="currentTab"
      :items="items"
      variant="pill"
      orientation="vertical"
      color="primary"
      :ui="{
        list: 'mt-4 mb-auto items-start',
        trigger: 'w-full justify-start text-left cursor-pointer',
        label: 'text-left'
      }"
    >

      <template #info>
        <UForm
          :schema="infoSchema"
          :state="infoState"
          class="space-y-4 p-4 pb-8"
          @submit="onInfoSubmit"
        >
          <CampaignInfoTab v-model:state="infoState" />
        </UForm>
      </template>

      <template #conditions>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!infoState.Id"
            title="Save campaign info first"
            description="Complete the campaign info to unlock conditions."
            color="warning"
            variant="soft"
          />
          <UCard
            v-else
            variant="soft"
            class="flex flex-col max-w-4xl p-6 rounded-2xl"
          >
            <div class="text-sm text-muted-foreground">Conditions setup will appear here.</div>
          </UCard>
        </div>
      </template>

      <template #recipients>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!infoState.Id"
            title="Save campaign info first"
            description="Complete the campaign info to unlock recipients."
            color="warning"
            variant="soft"
          />
          <UCard
            v-else
            variant="soft"
            class="flex flex-col max-w-4xl p-6 rounded-2xl"
          >
            <div class="text-sm text-muted-foreground">Recipients setup will appear here.</div>
          </UCard>
        </div>
      </template>

      <template #history>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!infoState.Id"
            title="Save campaign info first"
            description="Complete the campaign info to unlock history."
            color="warning"
            variant="soft"
          />
          <UCard
            v-else
            variant="soft"
            class="flex flex-col max-w-4xl p-6 rounded-2xl"
          >
            <div class="text-sm text-muted-foreground">Campaign history will appear here.</div>
          </UCard>
        </div>
      </template>

      <template #test>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!infoState.Id"
            title="Save campaign info first"
            description="Complete the campaign info to unlock tests."
            color="warning"
            variant="soft"
          />
          <UCard
            v-else
            variant="soft"
            class="flex flex-col max-w-4xl p-6 rounded-2xl"
          >
            <div class="text-sm text-muted-foreground">Test configuration will appear here.</div>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '#ui/types'
  import CampaignInfoTab from './CampaignInfoTab.vue'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  type CampaignType = 'email' | 'sms'

  type CampaignInfoState = {
    Id?: string
    Type: CampaignType
    Name: string
    Subject: string
    BodyHtml: string
  }

  const currentTab = ref('info')

  const defaultBodyHtml = `<html>
  <body>
    <h1>Hello {{Customer.FirstName}}</h1>
  </body>
</html>`

  const infoState = reactive<CampaignInfoState>({
    Id: undefined,
    Type: 'email',
    Name: '',
    Subject: '',
    BodyHtml: defaultBodyHtml
  })

  const items = ref<TabsItem[]>([
    { label: 'Campaign Info', slot: 'info', value: 'info', icon: 'i-solar:document-text-bold-duotone' },
    { label: 'Conditions', slot: 'conditions', value: 'conditions', icon: 'i-solar:filter-bold-duotone' },
    { label: 'Recipients', slot: 'recipients', value: 'recipients', icon: 'i-solar:users-group-rounded-bold-duotone' },
    { label: 'History', slot: 'history', value: 'history', icon: 'i-solar:clock-circle-bold-duotone' },
    { label: 'Test', slot: 'test', value: 'test', icon: 'i-solar:magic-stick-bold-duotone' }
  ])

  const infoSchema = z.object({
    Name: z.string().min(1, 'Name is required'),
    Subject: z.string().optional(),
    Type: z.enum(['email', 'sms'])
  }).superRefine((data, context) => {
    if (data.Type === 'email' && !data.Subject?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['Subject'],
        message: 'Subject is required'
      })
    }
  })

  const onInfoSubmit = () => {
    if (!infoState.Id) {
      infoState.Id = crypto.randomUUID()
    }
  }
</script>
