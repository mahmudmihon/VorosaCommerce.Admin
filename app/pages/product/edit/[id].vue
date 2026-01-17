<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Product">
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
      <div class="h-full overflow-auto">
        <div v-if="status === 'pending'" class="p-4 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>
        <div v-else-if="status === 'error'" class="p-4 text-red-500">
          Failed to load product
        </div>
        <ProductForm v-else-if="product" :initial-data="product" />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import ProductService from '~/services/ProductService'
  import ProductForm from '~/components/product/ProductForm.vue'

  const route = useRoute()
  const id = route.params.id as string

  const { data: product, status } = await useAsyncData(`product-${id}`, () => ProductService.getProductById(id))
</script>
