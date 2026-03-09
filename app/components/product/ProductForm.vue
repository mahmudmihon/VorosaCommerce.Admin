<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <div class="sticky top-0 z-10 flex justify-end gap-3 bg-default py-2">
      <UTooltip v-if="generalState.Id" text="Copy">
        <UButton
          icon="i-solar:copy-bold-duotone"
          color="secondary"
          variant="soft"
          size="md"
          :loading="copyLoading"
          class="cursor-pointer rounded-lg px-3"
          @click="openCopyModal"
        >
          Copy
        </UButton>
      </UTooltip>
      <UModal
        v-if="generalState.Id"
        v-model:open="copyModalOpen"
        title="Copy product"
        description="Create a new product from this one."
      >
        <template #body>
          <UForm
            :schema="copySchema"
            :state="copyState"
            class="space-y-4"
            @submit="onCopy"
          >
            <UFormField
              label="New product name"
              name="Name"
            >
              <UInput
                v-model="copyState.Name"
                size="xl"
                placeholder="Optional"
                class="w-full"
              />
            </UFormField>

            <UFormField
              name="Published"
            >
              <UCheckbox
                v-model="copyState.Published"
                label="Published"
              />
            </UFormField>

            <UFormField
              name="CopyImages"
            >
              <UCheckbox
                v-model="copyState.CopyImages"
                label="Copy images"
              />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="subtle"
                :disabled="copyLoading"
                class="cursor-pointer rounded-lg px-3"
                @click="copyModalOpen = false"
              />
              <UButton
                label="Copy product"
                color="primary"
                variant="solid"
                :loading="copyLoading"
                class="cursor-pointer rounded-lg px-3"
                type="submit"
              />
            </div>
          </UForm>
        </template>
      </UModal>
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
            class="cursor-pointer rounded-lg px-3"
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
              class="cursor-pointer rounded-lg px-3"
              @click="deleteModalOpen = false"
            />
            <UButton
              label="Delete"
              color="error"
              variant="solid"
              :loading="deleteLoading"
              class="cursor-pointer rounded-lg px-3"
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
        class="cursor-pointer rounded-lg px-3"
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
        trigger: 'w-full justify-start text-left cursor-pointer',
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
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!generalState.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <UForm
            v-else
            :schema="seoSchema"
            :state="seoState"
            class="space-y-4"
            @submit="onSeoSubmit"
          >
            <ProductSeoTab v-model:state="seoState" />
          </UForm>
        </div>
      </template>
      <template #pictures>
        <div class="space-y-4 p-4 pb-8">
          <ProductPicturesTab v-if="generalState.Id" :product-id="generalState.Id" />
          <GenericAlert
            v-else
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
        </div>
      </template>
      <template #inventory>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!generalState.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <UForm
            v-else
            :schema="inventorySchema"
            :state="inventoryState"
            class="space-y-4"
            @submit="onInventorySubmit"
          >
            <ProductInventoryTab v-model:state="inventoryState" />
          </UForm>
        </div>
      </template>
      <template #mappings>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!generalState.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <ProductMappingsTab v-else :product-id="generalState.Id" />
        </div>
      </template>
      <template #attributes>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!generalState.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <ProductAttributesTab v-else :product-id="generalState.Id" />
        </div>
      </template>
      <template #specifications>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!generalState.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <ProductSpecificationAttributesTab v-else :product-id="generalState.Id" />
        </div>
      </template>
    </UTabs>
  </div>
</template>
<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent, TabsItem } from '@nuxt/ui'
  import ProductService from '~/services/ProductService'
  import { type CopyProductDto, LowStockActivity, ManageInventoryMethod, ProductType, type ProductDto, type UpsertProductInfoDto, type UpsertProductInventoryDto, type UpsertProductSEOInfoDto } from '~/types/catalog/Product'
  import ProductGeneralTab from './ProductGeneralTab.vue'
  import ProductInventoryTab from './ProductInventoryTab.vue'
  import ProductAttributesTab from './ProductAttributesTab.vue'
  import ProductPicturesTab from './ProductPicturesTab.vue'
  import ProductMappingsTab from './ProductMappingsTab.vue'
  import ProductSeoTab from './ProductSeoTab.vue'
  import ProductSpecificationAttributesTab from './ProductSpecificationAttributesTab.vue'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    initialData?: ProductDto
  }>()

  const router = useRouter()
  const toast = useToast()
  const currentTab = ref('general')
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const copyModalOpen = ref(false)
  const copyLoading = ref(false)
  const unsavedAlertTitle = 'Save general information first'
  const unsavedAlertDescription = 'Save the product general information before adding details in other tabs.'

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
    },
    {
      label: 'Specification Attributes',
      slot: 'specifications',
      value: 'specifications'
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

  const copySchema = z.object({
    ProductId: z.string().min(1, 'Product is required'),
    Name: z.string().optional(),
    Published: z.boolean(),
    CopyImages: z.boolean()
  })

  type CopySchema = z.output<typeof copySchema>

  const copyState = reactive<CopySchema>({
    ProductId: '',
    Name: '',
    Published: true,
    CopyImages: true
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

  const openCopyModal = () => {
    if (!generalState.Id) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }
    copyState.ProductId = generalState.Id
    copyState.Name = ''
    copyState.Published = generalState.Published ?? true
    copyState.CopyImages = true
    copyModalOpen.value = true
  }

  async function onCopy(event: FormSubmitEvent<CopySchema>) {
    if (!generalState.Id) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }
    copyLoading.value = true
    try {
      const payload: CopyProductDto = {
        ProductId: event.data.ProductId,
        Name: event.data.Name?.trim() || undefined,
        Published: event.data.Published,
        CopyImages: event.data.CopyImages
      }
      const result = await ProductService.copyProduct(payload)
      toast.add({ title: 'Success', description: 'Product copied successfully', color: 'success' })
      copyModalOpen.value = false
      router.push(`/product/edit/${result}`)
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to copy product', color: 'error' })
    }
    finally {
      copyLoading.value = false
    }
  }
</script>
