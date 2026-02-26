<template>
  <div class="space-y-6">
    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:calendar-date-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Date Conditions</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Filter customers by relevant date ranges</p>

      <div class="mt-6 space-y-6">
        <div>
          <p class="text-sm font-medium text-default">Customers created from date</p>
          <div class="grid gap-5 sm:grid-cols-2 mt-3">
            <UFormField label="From" class="font-medium">
              <UInput
                v-model="state.createdFrom"
                type="date"
                icon="solar:calendar-minimalistic-bold-duotone"
                size="xl"
                placeholder="From"
                class="w-full rounded-2xl"
              />
            </UFormField>
            <UFormField label="To" class="font-medium">
              <UInput
                v-model="state.createdTo"
                type="date"
                icon="solar:calendar-minimalistic-bold-duotone"
                size="xl"
                placeholder="To"
                class="w-full rounded-2xl"
              />
            </UFormField>
          </div>
        </div>

        <div>
          <p class="text-sm font-medium text-default">Last purchase from date</p>
          <div class="grid gap-5 sm:grid-cols-2 mt-3">
            <UFormField label="From" class="font-medium">
              <UInput
                v-model="state.lastPurchaseFrom"
                type="date"
                icon="solar:calendar-minimalistic-bold-duotone"
                size="xl"
                placeholder="From"
                class="w-full rounded-2xl"
              />
            </UFormField>
            <UFormField label="To" class="font-medium">
              <UInput
                v-model="state.lastPurchaseTo"
                type="date"
                icon="solar:calendar-minimalistic-bold-duotone"
                size="xl"
                placeholder="To"
                class="w-full rounded-2xl"
              />
            </UFormField>
          </div>
        </div>
      </div>
    </UCard>

    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:users-group-two-rounded-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Customer Conditions</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Refine the audience based on customer behavior</p>

      <div class="grid gap-5 sm:grid-cols-2 mt-6">
        <UFormField label="Customer has an order" class="font-medium">
          <URadioGroup
            v-model="state.hasOrder"
            :items="customerConditionOptions"
            orientation="horizontal"
            class="mt-3"
          />
        </UFormField>

        <UFormField label="Customer has a shopping cart" class="font-medium">
          <URadioGroup
            v-model="state.hasCart"
            :items="customerConditionOptions"
            orientation="horizontal"
            class="mt-3"
          />
        </UFormField>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

type ConditionsState = {
  createdFrom: string
  createdTo: string
  lastPurchaseFrom: string
  lastPurchaseTo: string
  hasOrder: string
  hasCart: string
}

const state = defineModel<ConditionsState>('state', { required: true })

const customerConditionOptions = [
  { label: 'All', value: 'all' },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
]
</script>
