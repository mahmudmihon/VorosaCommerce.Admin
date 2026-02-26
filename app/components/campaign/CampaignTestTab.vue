<template>
  <div class="space-y-4 p-4 pb-8">
    <GenericAlert
      v-if="!campaignId"
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
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:test-tube-minimalistic-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Test Campaign</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Send a quick test before reaching your audience</p>

      <UAlert
        title="Send a test message to verify your campaign looks correct before sending to recipients."
        color="info"
        variant="soft"
        icon="i-solar:info-circle-bold-duotone"
        class="mt-6"
      />

      <div class="grid gap-4 sm:grid-cols-[1fr_auto] mt-6">
        <UFormField label="Test Email / Phone" class="font-medium">
          <UInput
            v-model="testEmail"
            type="text"
            placeholder="test@example.com or +1234567890"
            class="w-full rounded-2xl"
          />
        </UFormField>

        <div class="flex items-end">
          <UButton
            label="Send Test"
            icon="i-solar:plain-bold-duotone"
            color="success"
            variant="solid"
            class="cursor-pointer"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    campaignId?: string
  }>()

  const testEmail = ref('')
  const campaignId = computed(() => props.campaignId)
</script>
