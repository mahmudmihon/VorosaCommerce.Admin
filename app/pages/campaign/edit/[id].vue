<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Campaign">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/campaign/list"
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
          Failed to load campaign
        </div>
        <CampaignForm v-else-if="campaign" :initial-data="campaign" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import CampaignService from '~/services/CampaignService'
  import CampaignForm from '~/components/campaign/CampaignForm.vue'

  const route = useRoute()
  const id = route.params.id as string

  const { data: campaign, status } = await useAsyncData(`campaign-${id}`, () => CampaignService.getCampaignById(id))
</script>
