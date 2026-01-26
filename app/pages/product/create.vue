<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Product">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/product/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <ProductForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import ProductForm from '~/components/product/ProductForm.vue'
</script>
