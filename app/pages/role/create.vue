<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Role">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/role/list"
            icon="i-lucide-arrow-left"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <RoleForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import RoleForm from '~/components/role/RoleForm.vue'
</script>
