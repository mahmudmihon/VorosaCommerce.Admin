<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:route-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Categories</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="soft"
        class="cursor-pointer"
        :disabled="!productId"
        @click="openModal"
      >
        Map Category
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Map this product to categories</p>

    <UTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      class="mt-6"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
      }"
    />
  </UCard>

  <UModal
    v-model:open="modalOpen"
    title="Map category"
    description="Add a category mapping for this product"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Category"
          name="CategoryId"
          required
        >
          <USelectMenu
            v-model="state.CategoryId"
            :items="categoryOptions"
            searchable
            placeholder="Select category"
            value-key="value"
            label-key="label"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <UFormField
          label="Display Order"
          name="DisplayOrder"
        >
          <UInput
            v-model="state.DisplayOrder"
            size="xl"
            type="number"
            :min="0"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            :disabled="submitLoading"
            @click="modalOpen = false"
          />
          <UButton
            label="Save"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            :loading="submitLoading"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import CategoryService from '~/services/CategoryService'
  import ProductService from '~/services/ProductService'
  import type { CategoryDto } from '~/types/catalog/Category'
  import type { ProductCategoryDto, UpsertProductCategoryDto } from '~/types/catalog/Product'
  import type { PagedList } from '~/types/common/PagedList'

  const props = defineProps<{
    productId?: string
  }>()

  type SelectOption = { label: string, value: string }
  type TableRow = ProductCategoryDto & { id: string }

  const UButton = resolveComponent('UButton')

  const toast = useToast()
  const modalOpen = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const deleteLoadingId = ref<string | null>(null)

  const categoryOptions = ref<SelectOption[]>([])
  const productCategories = ref<ProductCategoryDto[]>([])

  const schema = z.object({
    CategoryId: z.string().min(1, 'Category is required'),
    DisplayOrder: z.coerce.number().min(0)
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Schema>({
    CategoryId: '',
    DisplayOrder: 0
  })

  const tableData = computed<TableRow[]>(() => {
    return productCategories.value.map(item => ({ ...item, id: item.CategoryId }))
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    return [
      { accessorKey: 'CategoryName', header: 'Category' },
      { accessorKey: 'DisplayOrder', header: 'Display Order' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) =>
          h(UButton, {
            icon: 'i-solar:trash-bin-2-bold-duotone',
            variant: 'ghost',
            color: 'neutral',
            class: 'cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10',
            disabled: !props.productId,
            loading: deleteLoadingId.value === row.original.CategoryId,
            onClick: () => onDelete(row.original.CategoryId)
          })
      }
    ]
  })

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories({
        CurrentPage: 1,
        PageSize: 1000
      })
      categoryOptions.value = ((response as PagedList<CategoryDto>).Items || []).map(category => ({
        label: category.Name,
        value: category.Id
      }))
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load categories', color: 'error' })
    }
  }

  const fetchProductCategories = async () => {
    if (!props.productId) {
      productCategories.value = []
      return
    }

    loading.value = true
    try {
      productCategories.value = await ProductService.getProductCategories(props.productId)
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load category mappings', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const openModal = () => {
    if (!props.productId) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }

    state.CategoryId = ''
    state.DisplayOrder = 0
    modalOpen.value = true
  }

  const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (!props.productId) return

    submitLoading.value = true
    try {
      const payload: UpsertProductCategoryDto = {
        ProductId: props.productId,
        CategoryId: event.data.CategoryId,
        DisplayOrder: event.data.DisplayOrder
      }
      await ProductService.addProductCategory(props.productId, payload)
      toast.add({ title: 'Success', description: 'Category mapped successfully', color: 'success' })
      modalOpen.value = false
      await fetchProductCategories()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to map category', color: 'error' })
    }
    finally {
      submitLoading.value = false
    }
  }

  const onDelete = async (categoryId: string) => {
    if (!props.productId) return

    deleteLoadingId.value = categoryId
    try {
      await ProductService.deleteProductCategory(props.productId, categoryId)
      toast.add({ title: 'Deleted', description: 'Category mapping removed', color: 'success' })
      await fetchProductCategories()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to remove category mapping', color: 'error' })
    }
    finally {
      deleteLoadingId.value = null
    }
  }

  watch(
    () => props.productId,
    () => {
      fetchProductCategories()
    },
    { immediate: true }
  )

  onMounted(() => {
    fetchCategories()
  })
</script>
