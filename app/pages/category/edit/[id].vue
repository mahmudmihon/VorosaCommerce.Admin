<script setup lang="ts">
import CategoryService from '~/services/CategoryService'
import CategoryForm from '~/components/category/CategoryForm.vue'

const route = useRoute()
const id = route.params.id as string

const { data: category, status } = await useAsyncData(`category-${id}`, () => CategoryService.getCategoryById(id))
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Edit Category">
        <template #right>
          <UButton label="Back" variant="ghost" color="neutral" to="/category/list" icon="i-lucide-arrow-left" />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="h-full overflow-auto">
        <div v-if="status === 'pending'" class="p-4 flex justify-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
        </div>
        <div v-else-if="status === 'error'" class="p-4 text-red-500">
          Failed to load category
        </div>
        <CategoryForm v-else-if="category" :initial-data="category" />
      </div>
    </template>
  </UDashboardPanel>
</template>
