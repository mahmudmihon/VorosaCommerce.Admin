<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:earth-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Search Engine Optimization</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Optimize your brand for better search visibility</p>

    <UFormField
      label="Search Engine Friendly Name"
      name="SeName"
      class="mt-6 font-medium"
      required
    >
      <UInput
        v-model="state.SeName"
        variant="outline"
        size="xl"
        placeholder="Enter search engine friendly name"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="Meta Title"
      name="MetaTitle"
      class="mt-4 font-medium"
    >
      <UInput
        v-model="state.MetaTitle"
        variant="outline"
        size="xl"
        placeholder="Enter meta title"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="Meta Description"
      name="MetaDescription"
      class="mt-4 font-medium"
    >
      <UTextarea
        v-model="state.MetaDescription"
        :rows="6"
        placeholder="Enter meta description"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="Meta Keywords"
      name="MetaKeywords"
      class="mt-4 font-medium"
    >
      <UInput
        v-model="state.MetaKeywords"
        variant="outline"
        size="xl"
        placeholder="Enter meta keywords"
        class="w-full rounded-2xl"
      />
    </UFormField>
  </UCard>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { UpsertBrandSEOInfoDto } from '~/types/catalog/Brand'

defineModel<UpsertBrandSEOInfoDto>('state', { required: true })
</script>
