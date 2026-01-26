<script setup lang="ts">
import BrandService from '~/services/BrandService'
import BrandForm from '~/components/brand/BrandForm.vue'

const route = useRoute()
const id = route.params.id as string

const { data: brand, status } = await useAsyncData(`brand-${id}`, () => BrandService.getBrandById(id))
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Brand">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/brand/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="h-full overflow-auto">
        <div v-if="status === 'pending'" class="p-4 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>
        <div v-else-if="status === 'error'" class="p-4 text-red-500">
          Failed to load brand
        </div>
        <BrandForm v-else-if="brand" :initial-data="brand" />
      </div>
    </template>
  </UDashboardPanel>
</template>
