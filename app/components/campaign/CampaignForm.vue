<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <div class="sticky top-0 z-10 flex justify-end gap-3 bg-default py-2">
      <UButton
        v-if="infoState.Id"
        label="Send"
        icon="i-solar:plain-bold-duotone"
        size="md"
        color="secondary"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
      />
      <UButton
        v-if="infoState.Id"
        label="Delete"
        icon="i-solar:trash-bin-2-bold-duotone"
        size="md"
        color="error"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
      />
      <UButton
        icon="solar:diskette-bold-duotone"
        size="md"
        color="primary"
        variant="solid"
        class="cursor-pointer rounded-lg px-3"
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
          <CampaignConditionsTab v-else v-model:state="conditionsState" />
        </div>
      </template>

      <template #recipients>
        <CampaignRecipientsTab :campaign-id="infoState.Id" />
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
        <CampaignTestTab :campaign-id="infoState.Id" />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '#ui/types'
  import CampaignInfoTab from './CampaignInfoTab.vue'
  import CampaignConditionsTab from './CampaignConditionsTab.vue'
  import CampaignRecipientsTab from './CampaignRecipientsTab.vue'
  import CampaignTestTab from './CampaignTestTab.vue'
  import GenericAlert from '~/components/common/GenericAlert.vue'
  import CampaignService from '~/services/CampaignService'
  import { CampaignType } from '~/types/marketing/Campaign'
  import type { CampaignInfoDto, UpsertCampaignInfoDto } from '~/types/marketing/Campaign'

  const props = defineProps<{
    initialData?: CampaignInfoDto
  }>()

  type CampaignInfoState = {
    Id?: string
    Type: 'email' | 'sms'
    Name: string
    Subject: string
    BodyHtml: string
    ScheduledOn?: string | null
  }

  const currentTab = ref('info')

  const defaultBodyHtml = `<html>
  <body>
    <h1>Hello {{Customer.FirstName}}</h1>
  </body>
</html>`

  const infoState = reactive<CampaignInfoState>({
    Id: props.initialData?.Id,
    Type: props.initialData?.Type === CampaignType.Sms ? 'sms' : 'email',
    Name: props.initialData?.Name ?? '',
    Subject: props.initialData?.Subject ?? '',
    BodyHtml: props.initialData?.Body ?? defaultBodyHtml,
    ScheduledOn: props.initialData?.ScheduledDate ?? null
  })

  const conditionsState = reactive({
    createdFrom: '',
    createdTo: '',
    lastPurchaseFrom: '',
    lastPurchaseTo: '',
    hasOrder: 'all',
    hasCart: 'all'
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
    ScheduledOn: z.string().nullable().optional(),
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

  const toast = useToast()
  const router = useRouter()

  const onInfoSubmit = async () => {
    const payload: UpsertCampaignInfoDto = {
      Id: infoState.Id,
      Type: infoState.Type === 'email' ? CampaignType.Email : CampaignType.Sms,
      Name: infoState.Name,
      Subject: infoState.Type === 'email' ? infoState.Subject : null,
      Body: infoState.BodyHtml,
      ScheduledDate: infoState.ScheduledOn ?? null
    }

    try {
      const result = await CampaignService.upsertCampaignInfo(payload)
      toast.add({ title: 'Success', description: 'Campaign info saved successfully', color: 'success' })

      if (!infoState.Id) {
        infoState.Id = result.Id
        router.push(`/campaign/edit/${result.Id}`)
      }
      else {
        infoState.Id = result.Id
      }
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save campaign info', color: 'error' })
    }
  }
</script>
