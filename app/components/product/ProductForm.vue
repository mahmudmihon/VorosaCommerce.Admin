<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <div class="sticky top-0 z-10 flex justify-end gap-3 bg-default py-2">
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
        @click="onSave"
      >
        Save
      </UButton>
    </div>
    <UTabs
      v-model="currentTab"
      :items="items"
      orientation="vertical"
      variant="pill"
      color="primary"
      :ui="{
        list: 'mt-4 mb-auto items-start',
        trigger: 'w-full justify-start text-left',
        label: 'text-left'
      }"
    >
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
      <template #pictures>
        <div class="space-y-4 p-4 pb-8">
          <ProductPicturesTab v-if="generalState.Id" :product-id="generalState.Id" />
          <div v-else class="text-center text-gray-500 py-8">
            Please save the product first to add pictures.
          </div>
        </div>
      </template>
      <template #inventory>
        <UForm
          :schema="inventorySchema"
          :state="inventoryState"
          class="space-y-4 p-4 pb-8"
          @submit="onInventorySubmit"
        >
          <ProductInventoryTab v-model:state="inventoryState" />
        </UForm>
      </template>
      <template #mappings>
        <div class="space-y-4 p-4 pb-8">
          <ProductMappingsTab :product-id="generalState.Id" />
        </div>
      </template>
      <template #attributes>
        <div class="space-y-4 p-4 pb-8">
          <ProductAttributesTab :product-id="generalState.Id" />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '@nuxt/ui'
  import ProductService from '~/services/ProductService'
  import { LowStockActivity, ManageInventoryMethod, ProductType, type ProductDto, type UpsertProductInfoDto, type UpsertProductInventoryDto, type UpsertProductSEOInfoDto } from '~/types/catalog/Product'
  import ProductGeneralTab from './ProductGeneralTab.vue'
  import ProductInventoryTab from './ProductInventoryTab.vue'
  import ProductAttributesTab from './ProductAttributesTab.vue'
  import ProductPicturesTab from './ProductPicturesTab.vue'
  import ProductMappingsTab from './ProductMappingsTab.vue'
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
    Tags: props.initialData?.Tags ?? []
  })

  const seoState = reactive<UpsertProductSEOInfoDto>({
    Id: props.initialData?.Id || '',
    SeName: props.initialData?.SeName || '',
    MetaKeywords: props.initialData?.MetaKeywords,
    MetaDescription: props.initialData?.MetaDescription,
    MetaTitle: props.initialData?.MetaTitle
  })

  const normalizeManageInventoryMethod = (value?: number) => {
    const allowed = [
      ManageInventoryMethod.DontManageStock,
      ManageInventoryMethod.ManageStock,
      ManageInventoryMethod.ManageStockByAttributes
    ]

    return allowed.includes(value as ManageInventoryMethod)
      ? (value as ManageInventoryMethod)
      : ManageInventoryMethod.DontManageStock
  }

  const normalizeLowStockActivity = (value?: number) => {
    const allowed = [
      LowStockActivity.Nothing,
      LowStockActivity.NotifyAdmin,
      LowStockActivity.Unpublish,
      LowStockActivity.MarkAsOutOfStock
    ]

    return allowed.includes(value as LowStockActivity)
      ? (value as LowStockActivity)
      : LowStockActivity.Nothing
  }

  const inventoryState = reactive<UpsertProductInventoryDto>({
    ProductId: props.initialData?.Id || '',
    ManageInventoryMethod: normalizeManageInventoryMethod(props.initialData?.ManageInventoryMethod),
    LowStockActivity: normalizeLowStockActivity(props.initialData?.LowStockActivity),
    NotifyAdminForQuantityBelow: props.initialData?.NotifyAdminForQuantityBelow ?? 0,
    StockQuantity: props.initialData?.StockQuantity ?? 0,
    ReservedQuantity: props.initialData?.ReservedQuantity ?? 0,
    OrderMinimumQuantity: props.initialData?.OrderMinimumQuantity ?? 0,
    OrderMaximumQuantity: props.initialData?.OrderMaximumQuantity ?? 0
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
    },
    {
      label: 'Pictures',
      slot: 'pictures',
      value: 'pictures'
    },
    {
      label: 'Inventory',
      slot: 'inventory',
      value: 'inventory'
    },
    {
      label: 'Mappings',
      slot: 'mappings',
      value: 'mappings'
    },
    {
      label: 'Product Attributes',
      slot: 'attributes',
      value: 'attributes'
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

  const inventorySchema = z.object({
    ManageInventoryMethod: z.coerce.number(),
    LowStockActivity: z.coerce.number(),
    NotifyAdminForQuantityBelow: z.coerce.number().min(0),
    StockQuantity: z.coerce.number().min(0),
    ReservedQuantity: z.coerce.number().min(0),
    OrderMinimumQuantity: z.coerce.number().min(0),
    OrderMaximumQuantity: z.coerce.number().min(0)
  }).superRefine((data, ctx) => {
    if (data.LowStockActivity === LowStockActivity.NotifyAdmin && data.NotifyAdminForQuantityBelow < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NotifyAdminForQuantityBelow'],
        message: 'Notify admin threshold must be at least 1'
      })
    }
  })

  async function onGeneralSubmit() {
    try {
      const result = await ProductService.upsertProduct(generalState)

      toast.add({ title: 'Success', description: 'Product saved successfully', color: 'success' })

      if (!generalState.Id) {
        generalState.Id = result.Id
        seoState.Id = result.Id
        inventoryState.ProductId = result.Id
        router.push(`/product/edit/${result.Id}`)
      }
      else {
        generalState.Id = result.Id
        seoState.Id = result.Id
        inventoryState.ProductId = result.Id
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

  async function onInventorySubmit() {
    if (!generalState.Id) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }

    inventoryState.ProductId = generalState.Id

    try {
      await ProductService.updateProductInventory(inventoryState)
      toast.add({ title: 'Success', description: 'Inventory updated successfully', color: 'success' })
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to update inventory', color: 'error' })
    }
  }

  const onSave = () => {
    if (currentTab.value === 'general') {
      onGeneralSubmit()
      return
    }

    if (currentTab.value === 'seo') {
      onSeoSubmit()
      return
    }

    if (currentTab.value === 'inventory') {
      onInventorySubmit()
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
