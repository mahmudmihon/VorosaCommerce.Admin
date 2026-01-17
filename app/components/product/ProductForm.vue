<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <UTabs
      v-model="currentTab"
      :items="items"
      variant="link"
      :ui="{ list: 'sticky top-0 z-10 bg-default' }"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-3">
          <UModal
            v-if="generalState.Id"
            v-model:open="deleteModalOpen"
            title="Delete product"
            description="This action cannot be undone."
          >
            <UTooltip text="Delete">
              <UButton
                icon="i-solar:trash-bin-2-bold-duotone"
                color="error"
                variant="soft"
                square
                size="md"
                :loading="deleteLoading"
                aria-label="Delete product"
                class="cursor-pointer"
              >
                Delete
              </UButton>
            </UTooltip>

            <template #body>
              <div class="flex justify-end gap-2">
                <UButton
                  label="Cancel"
                  color="neutral"
                  variant="subtle"
                  :disabled="deleteLoading"
                  class="cursor-pointer"
                  @click="deleteModalOpen = false"
                />
                <UButton
                  label="Delete"
                  color="error"
                  variant="solid"
                  :loading="deleteLoading"
                  class="cursor-pointer"
                  @click="onDelete"
                />
              </div>
            </template>
          </UModal>
          <UButton
            icon="solar:diskette-bold-duotone"
            size="md"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            @click="currentTab === 'general' ? onGeneralSubmit() : onSeoSubmit()"
          >
            Save
          </UButton>
        </div>
      </template>
      <template #general>
        <UForm
          :schema="generalSchema"
          :state="generalState"
          class="space-y-4 p-4 pb-8"
          @submit="onGeneralSubmit"
        >
          <ProductGeneralTab v-model:state="generalState" />
        </UForm>
      </template>
      <template #seo>
        <UForm
          :schema="seoSchema"
          :state="seoState"
          class="space-y-4 p-4 pb-8"
          @submit="onSeoSubmit"
        >
          <ProductSeoTab v-model:state="seoState" />
        </UForm>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '@nuxt/ui'
  import ProductService from '~/services/ProductService'
  import { ProductType, type ProductDto, type UpsertProductInfoDto, type UpsertProductSEOInfoDto } from '~/types/catalog/Product'
  import ProductGeneralTab from './ProductGeneralTab.vue'
  import ProductSeoTab from './ProductSeoTab.vue'

  const props = defineProps<{
    initialData?: ProductDto
  }>()

  const router = useRouter()
  const toast = useToast()
  const currentTab = ref('general')
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)

  const generalState = reactive<UpsertProductInfoDto>({
    Id: props.initialData?.Id,
    ProductType: props.initialData?.ProductType ?? ProductType.SimpleProduct,
    Name: props.initialData?.Name || '',
    Sku: props.initialData?.Sku || '',
    ShortDescription: props.initialData?.ShortDescription,
    FullDescription: props.initialData?.FullDescription,
    Price: props.initialData?.Price ?? 0,
    OldPrice: props.initialData?.OldPrice ?? 0,
    BrandId: props.initialData?.BrandId,
    DisplayOrder: props.initialData?.DisplayOrder ?? 0,
    Published: props.initialData?.Published ?? true,
    Pictures: [
      {
        PictureId: props.initialData?.Pictures?.[0]?.Id,
        Url: props.initialData?.Pictures?.[0]?.Url
      }
    ]
  })

  const seoState = reactive<UpsertProductSEOInfoDto>({
    Id: props.initialData?.Id || '',
    SeName: props.initialData?.SeName || '',
    MetaKeywords: props.initialData?.MetaKeywords,
    MetaDescription: props.initialData?.MetaDescription,
    MetaTitle: props.initialData?.MetaTitle
  })

  const items = ref<TabsItem[]>([
    {
      label: 'General',
      slot: 'general',
      value: 'general'
    },
    {
      label: 'SEO',
      slot: 'seo',
      value: 'seo'
    }
  ])

  const generalSchema = z.object({
    Name: z.string().min(1, 'Name is required'),
    Sku: z.string().min(1, 'SKU is required'),
    Price: z.coerce.number().min(0),
    OldPrice: z.coerce.number().min(0),
    DisplayOrder: z.coerce.number()
  })

  const seoSchema = z.object({
    SeName: z.string().min(1, 'SEO Name is required')
  })

  async function onGeneralSubmit() {
    try {
      const result = await ProductService.upsertProduct(generalState)

      toast.add({ title: 'Success', description: 'Product saved successfully', color: 'success' })

      if (!generalState.Id) {
        generalState.Id = result.Id
        seoState.Id = result.Id
        router.push(`/product/edit/${result.Id}`)
      }
      else {
        generalState.Id = result.Id
        seoState.Id = result.Id
      }
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save product', color: 'error' })
    }
  }

  async function onSeoSubmit() {
    try {
      await ProductService.updateProductSeo(seoState)
      toast.add({ title: 'Success', description: 'SEO info updated successfully', color: 'success' })
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to update SEO info', color: 'error' })
    }
  }

  async function onDelete() {
    if (!generalState.Id) return

    deleteLoading.value = true
    try {
      await ProductService.deleteProduct(generalState.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Product deleted successfully', color: 'success' })
      router.push('/product/list')
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete product', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
