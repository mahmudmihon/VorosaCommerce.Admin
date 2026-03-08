<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Homepage Template">
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
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <HomepageTemplateForm :template-id="templateId" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import HomepageTemplateForm from '~/components/homepage-template/HomepageTemplateForm.vue'

  const route = useRoute()
  const templateId = computed(() => route.params.id as string)
</script>