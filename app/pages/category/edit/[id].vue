<script setup lang="ts">
const route = useRoute()
const id = route.params.id
</script>

<template>
  <UDashboardPanel>
    <UDashboardNavbar title="Edit Category">
        <template #right>
             <UButton label="Back" variant="ghost" to="/category/list" icon="i-lucide-arrow-left" />
        </template>
    </UDashboardNavbar>
    <template #body>
      <UCard>
        <div class="p-4">
          Edit Category {{ id }} (Not implemented yet)
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
