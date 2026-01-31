<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Discount">
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
      <div class="h-full overflow-auto">
        <div v-if="loading" class="p-4 text-muted-foreground">
          Loading discount...
        </div>
        <div v-else-if="error" class="p-4 text-red-500">
          {{ error }}
        </div>
        <DiscountForm v-else-if="discount" :initial-data="discount" />
        <div v-else class="p-4 text-red-500">
          Discount not found
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import DiscountForm from '~/components/discount/DiscountForm.vue'
  import DiscountService from '~/services/DiscountService'
  import type { DiscountDto } from '~/types/catalog/Discount'

  const route = useRoute()
  const toast = useToast()
  const id = route.params.id as string
  const discount = ref<DiscountDto | null>(null)
  const loading = ref(true)
  const error = ref('')

  const fetchDiscount = async () => {
    if (!id) {
      loading.value = false
      error.value = 'Discount not found'
      return
    }

    loading.value = true
    error.value = ''

    try {
      const response = await DiscountService.getDiscountById(id)
      discount.value = response
    } 
    catch (err) {
      console.error('Error fetching discount:', err)
      error.value = 'Failed to load discount'
      toast.add({ title: 'Error', description: 'Failed to load discount', color: 'error' })
    } 
    finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchDiscount()
  })
</script>
