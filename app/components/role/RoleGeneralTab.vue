<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:notes-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Basic Information</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Define the core details of the role</p>

    <UFormField
      label="Name"
      name="Name"
      class="mt-6 font-medium"
      required
    >
      <UInput
        v-model="state.Name"
        variant="outline"
        size="xl"
        placeholder="Enter role name"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="System Name"
      name="SystemName"
      class="mt-4 font-medium"
      required
    >
      <UInput
        v-model="state.SystemName"
        variant="outline"
        size="xl"
        placeholder="Enter system name"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <div class="flex flex-wrap gap-6 mt-6">
      <UCheckbox
        v-model="state.Active"
        label="Active"
        name="Active"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import type { UpsertRoleDto } from '~/types/identity/Role'

  defineModel<UpsertRoleDto>('state', { required: true })
</script>
