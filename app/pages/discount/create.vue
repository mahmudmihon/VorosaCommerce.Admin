<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Discount">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/discount/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DiscountForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import DiscountForm from '~/components/discount/DiscountForm.vue'
</script>