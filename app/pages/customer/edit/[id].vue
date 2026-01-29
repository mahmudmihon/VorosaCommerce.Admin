<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Customer">
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
      <div class="h-full overflow-auto">
        <div v-if="status === 'pending'" class="p-4 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>
        <div v-else-if="status === 'error'" class="p-4 text-red-500">
          Failed to load customer
        </div>
        <CustomerForm v-else-if="customer" :initial-data="customer" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import CustomerService from '~/services/CustomerService'
  import CustomerForm from '~/components/customer/CustomerForm.vue'

  const route = useRoute()
  const id = route.params.id as string

  const { data: customer, status } = await useAsyncData(`customer-${id}`, () => CustomerService.getCustomerById(id))
</script>