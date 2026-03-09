<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <UTabs
      v-model="currentTab"
      :items="items"
      variant="link"
      :ui="{ list: 'sticky top-0 z-10 bg-default', trigger: 'cursor-pointer' }"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-3">
          <UModal
            v-if="generalState.Id"
            v-model:open="deleteModalOpen"
            title="Delete discount"
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
                aria-label="Delete discount"
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
            @click="onGeneralSubmit"
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
          <DiscountGeneralTab v-model:state="generalState" />
        </UForm>
      </template>
      <template #requirements>
        <DiscountRequirementsTab :discount-id="generalState.Id" />
      </template>
      <template #assign-products>
        <DiscountAssignProductsTab :discount-id="generalState.Id" />
      </template>
      <template #assign-categories>
        <DiscountAssignCategoriesTab :discount-id="generalState.Id" />
      </template>
      <template #coupon-codes>
        <DiscountCouponCodesTab :discount-id="generalState.Id" />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '#ui/types'
  import DiscountService from '~/services/DiscountService'
  import { DiscountLimitationType, DiscountType, type DiscountDto, type UpsertDiscountDto } from '~/types/catalog/Discount'
  import DiscountGeneralTab from './DiscountGeneralTab.vue'
  import DiscountRequirementsTab from './DiscountRequirementsTab.vue'
  import DiscountAssignProductsTab from './DiscountAssignProductsTab.vue'
  import DiscountAssignCategoriesTab from './DiscountAssignCategoriesTab.vue'
  import DiscountCouponCodesTab from './DiscountCouponCodesTab.vue'

  const props = defineProps<{
    initialData?: DiscountDto
  }>()

  const router = useRouter()
  const toast = useToast()
  const currentTab = ref('general')
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)

  const generalState = reactive<UpsertDiscountDto>({
    Id: props.initialData?.Id,
    DiscountType: props.initialData?.DiscountType ?? DiscountType.AssignedToOrderSubtotal,
    Name: props.initialData?.Name || '',
    UsePercentage: props.initialData?.UsePercentage ?? false,
    DiscountPercentage: props.initialData?.DiscountPercentage ?? 0,
    DiscountAmount: props.initialData?.DiscountAmount ?? 0,
    MaximumDiscountAmount: props.initialData?.MaximumDiscountAmount ?? 0,
    StartDateUtc: props.initialData?.StartDateUtc ?? null,
    EndDateUtc: props.initialData?.EndDateUtc ?? null,
    RequiresCouponCode: props.initialData?.RequiresCouponCode ?? false,
    IsCumulative: props.initialData?.IsCumulative ?? false,
    DiscountLimitationType: props.initialData?.DiscountLimitationType ?? DiscountLimitationType.NoLimits,
    LimitationTimes: props.initialData?.LimitationTimes ?? 0,
    IsEnabled: props.initialData?.IsEnabled ?? true
  })

  const items = computed<TabsItem[]>(() => {
    const baseItems: TabsItem[] = [
      {
        label: 'General',
        slot: 'general',
        value: 'general'
      },
      {
        label: 'Requirements',
        slot: 'requirements',
        value: 'requirements'
      }
    ]

    if (generalState.DiscountType === DiscountType.AssignedToProducts) {
      baseItems.push({
        label: 'Applied To Products',
        slot: 'assign-products',
        value: 'assign-products'
      })
    }

    if (generalState.DiscountType === DiscountType.AssignedToCategories) {
      baseItems.push({
        label: 'Applied To Categories',
        slot: 'assign-categories',
        value: 'assign-categories'
      })
    }

    if (generalState.RequiresCouponCode && generalState.Id) {
      baseItems.push({
        label: 'Coupon Codes',
        slot: 'coupon-codes',
        value: 'coupon-codes'
      })
    }

    return baseItems
  })

  const generalSchema = z.object({
    Name: z.string().min(1, 'Name is required'),
    DiscountType: z.coerce.number(),
    DiscountPercentage: z.coerce.number().optional().nullable(),
    DiscountAmount: z.coerce.number().optional().nullable(),
    MaximumDiscountAmount: z.coerce.number().optional().nullable(),
    LimitationTimes: z.coerce.number().optional().nullable()
  })

  const onGeneralSubmit = async () => {
    try {
      const response = await DiscountService.upsertDiscount({ ...generalState })
      const responseId = response.Id || generalState.Id

      if (responseId) {
        generalState.Id = responseId
      }

      generalState.DiscountType = response.DiscountType
      generalState.Name = response.Name
      generalState.UsePercentage = response.UsePercentage ?? false
      generalState.DiscountPercentage = response.DiscountPercentage ?? null
      generalState.DiscountAmount = response.DiscountAmount ?? null
      generalState.MaximumDiscountAmount = response.MaximumDiscountAmount ?? null
      generalState.StartDateUtc = response.StartDateUtc ?? null
      generalState.EndDateUtc = response.EndDateUtc ?? null
      generalState.RequiresCouponCode = response.RequiresCouponCode ?? false
      generalState.IsCumulative = response.IsCumulative ?? false
      generalState.DiscountLimitationType = response.DiscountLimitationType ?? DiscountLimitationType.NoLimits
      generalState.LimitationTimes = response.LimitationTimes ?? null
      generalState.IsEnabled = response.IsEnabled ?? true

      toast.add({ title: 'Success', description: 'Discount saved successfully', color: 'success' })

      if (!props.initialData?.Id && responseId) {
        router.push(`/discount/edit/${responseId}`)
      }
    }
    catch (error) {
      console.error('Error saving discount:', error)
      toast.add({ title: 'Error', description: 'Failed to save discount', color: 'error' })
    }
  }

  const onDelete = () => {
    if (!generalState.Id) return

    deleteLoading.value = true

    try {
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Discount deleted successfully', color: 'success' })
      router.push('/discount/list')
    }
    finally {
      deleteLoading.value = false
    }
  }

  watch(() => generalState.DiscountType, (value) => {
    if (value !== DiscountType.AssignedToProducts && currentTab.value === 'assign-products') {
      currentTab.value = 'general'
    }
    if (value !== DiscountType.AssignedToCategories && currentTab.value === 'assign-categories') {
      currentTab.value = 'general'
    }
  })

  watch(() => generalState.RequiresCouponCode, (value) => {
    if (!value && currentTab.value === 'coupon-codes') {
      currentTab.value = 'general'
    }
  })
</script>
