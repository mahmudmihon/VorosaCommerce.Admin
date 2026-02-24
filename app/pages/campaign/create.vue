<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Campaign">
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
      <CampaignForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import CampaignForm from '~/components/campaign/CampaignForm.vue'
</script>
