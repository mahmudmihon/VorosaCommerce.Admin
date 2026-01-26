<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Brand">
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
      <BrandForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import BrandForm from '~/components/brand/BrandForm.vue'
</script>
