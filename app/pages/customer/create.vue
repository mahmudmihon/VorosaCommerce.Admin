<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Customer">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/customer/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <CustomerForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import CustomerForm from '~/components/customer/CustomerForm.vue'
</script>