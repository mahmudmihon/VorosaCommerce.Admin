<template>
  <div class="space-y-4">
    <!-- Default Template Card -->
    <UCard variant="soft" class="flex flex-col max-w-4xl p-2 rounded-2xl">
      <div class="flex items-center justify-between">
         <div class="flex items-center gap-2">
            <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
                <UIcon name="i-solar:star-bold-duotone" class="w-6 h-6 text-green-500" />
            </div>
            <div>
                <h3 class="text-base font-medium">Default Template</h3>
                <p class="text-sm text-muted-foreground">{{ state.IsDefault ? 'This template is set as default' : 'This template is not set as default' }}</p>
            </div>
         </div>
         <USwitch v-model="state.IsDefault" size="lg" :ui="{ base: 'cursor-pointer' }" />
      </div>
    </UCard>

    <!-- Template Details Card -->
    <UCard variant="soft" class="flex flex-col max-w-4xl p-2 rounded-2xl">
        <div class="flex gap-2 items-center">
            <UIcon name="i-solar:document-text-bold-duotone" class="w-6 h-6 text-green-500" />
            <h3 class="text-xl font-medium">Template Details</h3>
        </div>

        <div class="mt-6">
            <UFormField label="Template Name" name="Name" class="font-medium" required>
                <UInput v-model="state.Name" variant="outline" size="xl" placeholder="e.g., Holiday Season Homepage" class="w-full rounded-2xl" />
                <template #help>
                    <span class="text-muted-foreground text-xs">Give your template a descriptive name for easy identification</span>
                </template>
            </UFormField>
        </div>
    </UCard>

    <!-- Schedule Card -->
    <UCard variant="soft" class="flex flex-col max-w-4xl p-2 rounded-2xl">
        <div class="flex gap-2 items-center">
            <UIcon name="i-solar:clock-circle-bold-duotone" class="w-6 h-6 text-green-500" />
            <h3 class="text-xl font-medium">Schedule</h3>
        </div>

        <div class="bg-blue-200 p-3 rounded-xl mb-4 mt-4 flex items-center gap-2 text-sm text-gray-600 border border-dashed border-gray-300">
             <UIcon name="i-solar:info-circle-bold-duotone" class="text-gray-400 w-5 h-5" />
             Optionally set a date range for when this template should be active. Leave empty for an always-active template.
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
            <UFormField label="Start Date" name="StartDate" class="font-medium">
                <UInput v-model="state.StartDate" type="datetime-local" icon="i-solar:calendar-minimalistic-bold-duotone" size="xl" placeholder="Select start date & time" class="w-full rounded-2xl" />
            </UFormField>
            
            <UFormField label="End Date" name="EndDate" class="font-medium">
                <UInput v-model="state.EndDate" type="datetime-local" icon="i-solar:calendar-minimalistic-bold-duotone" size="xl" placeholder="Select end date & time" class="w-full rounded-2xl" />
            </UFormField>
        </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import type { UpsertHomepageTemplateDto } from '~/types/homepagetemplate/HomepageTemplate';

  const state = defineModel<UpsertHomepageTemplateDto>('state', { required: true });
</script>
