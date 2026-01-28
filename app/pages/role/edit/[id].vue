<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Role">
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
      <div class="h-full overflow-auto">
        <div v-if="status === 'pending'" class="p-4 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>
        <div v-else-if="status === 'error'" class="p-4 text-red-500">
          Failed to load role
        </div>
        <RoleForm v-else-if="role" :initial-data="role" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import RoleService from '~/services/RoleService'
  import RoleForm from '~/components/role/RoleForm.vue'

  const route = useRoute()
  const id = route.params.id as string

  const { data: role, status } = await useAsyncData(`role-${id}`, () => RoleService.getRoleById(id))
</script>
