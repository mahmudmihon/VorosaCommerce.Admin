<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Category">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/category/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <CategoryForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import CategoryForm from '~/components/category/CategoryForm.vue'
</script>
