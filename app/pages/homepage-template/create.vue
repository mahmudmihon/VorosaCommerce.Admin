<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Create Homepage Template">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Back"
            variant="ghost"
            color="neutral"
            to="/homepage-template/list"
            icon="i-lucide-arrow-left"
            class="rounded-xl cursor-pointer"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <HomepageTemplateForm />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import HomepageTemplateForm from '~/components/homepage-template/HomepageTemplateForm.vue'
</script>
