<template>
  <div class="space-y-4 p-4 pb-8">
    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex gap-2 items-center">
          <Icon
            icon="solar:ticket-bold-duotone"
            width="24"
            height="24"
            style="color: #00C16A"
          />
          <h3 class="text-xl font-medium">Coupon Codes</h3>
        </div>
        <UButton
          label="Add Coupon"
          icon="i-solar:add-circle-bold-duotone"
          color="primary"
          variant="solid"
          class="cursor-pointer"
          :disabled="!discountId"
          @click="openAddModal"
        />
      </div>
      <p class="text-sm text-muted-foreground mt-2">Manage coupon codes for this discount</p>

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
      >
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip v-if="row.original.UsageCount === 0" text="Edit">
              <UButton
                icon="i-solar:pen-new-square-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10"
                :disabled="!row.original.Id"
                @click="openEditModal(row.original)"
              />
            </UTooltip>
            <UTooltip text="Delete">
              <UButton
                icon="i-solar:trash-bin-2-bold-duotone"
                variant="ghost"
                color="neutral"
                class="cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10"
                :loading="deleteLoadingId === row.original.Id"
                :disabled="!row.original.Id || deleteLoadingId === row.original.Id"
                @click="onDeleteClick(row.original)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-4">
        <div class="text-sm text-muted">
          Total {{ tableData.length }} coupon codes
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="editModalOpen"
      :title="editModalTitle"
      description="Save a coupon code for this discount"
    >
      <template #body>
        <UForm
          :schema="couponSchema"
          :state="formState"
          class="space-y-4"
          @submit="onSaveCoupon"
        >
          <UFormField
            label="Coupon Code"
            name="CouponCode"
            class="font-medium"
            required
          >
            <UInput
              v-model="formState.CouponCode"
              variant="outline"
              size="xl"
              placeholder="e.g., SAVE10"
              class="w-full rounded-2xl"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              :disabled="editLoading"
              @click="editModalOpen = false"
            />
            <UButton
              label="Save"
              color="primary"
              variant="solid"
              class="cursor-pointer"
              :loading="editLoading"
              @click="onSaveCoupon"
            />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteModalOpen"
      title="Delete coupon code"
      :description="deleteModalDescription"
    >
      <template #body>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            :disabled="deleteLoading"
            @click="deleteModalOpen = false"
          />
          <UButton
            label="Delete"
            color="error"
            variant="solid"
            class="cursor-pointer"
            :loading="deleteLoading"
            @click="onConfirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TableColumn } from '@nuxt/ui'
  import { Icon } from '@iconify/vue'
  import DiscountService from '~/services/DiscountService'
  import type { DiscountCouponDto, UpsertDiscountCouponDto } from '~/types/catalog/Discount'

  const props = defineProps<{
    discountId?: string
  }>()

  type TableRow = DiscountCouponDto & { id: string }

  const toast = useToast()
  const loading = ref(false)
  const coupons = ref<DiscountCouponDto[]>([])
  const editModalOpen = ref(false)
  const editLoading = ref(false)
  const editCoupon = ref<DiscountCouponDto | null>(null)
  const deleteLoadingId = ref<string | null>(null)
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  const deleteTarget = ref<DiscountCouponDto | null>(null)

  const formState = reactive<UpsertDiscountCouponDto>({
    Id: undefined,
    DiscountId: props.discountId || '',
    CouponCode: ''
  })

  const couponSchema = z.object({
    CouponCode: z.string().min(1, 'Coupon code is required')
  })

  const tableData = computed<TableRow[]>(() => {
    return coupons.value.map(item => ({ ...item, id: item.Id }))
  })

  const columns = computed<TableColumn<TableRow>[]>(() => ([
    { accessorKey: 'CouponCode', header: 'Coupon Code' },
    { accessorKey: 'UsageCount', header: 'Usage Count' },
    { id: 'actions', header: 'Actions' }
  ]))

  const editModalTitle = computed(() => (editCoupon.value ? 'Edit coupon code' : 'Add coupon code'))

  const deleteModalDescription = computed(() => {
    const count = deleteTarget.value?.UsageCount ?? 0
    if (count <= 0) return 'This action cannot be undone.'
    return `This coupon has been used ${count} time${count === 1 ? '' : 's'}. This action cannot be undone.`
  })

  const fetchCoupons = async () => {
    if (!props.discountId) {
      coupons.value = []
      return
    }

    loading.value = true

    try {
      coupons.value = await DiscountService.getDiscountCoupons({
        DiscountId: props.discountId
      })
    } catch (error) {
      console.error('Error fetching coupon codes:', error)
      toast.add({ title: 'Error', description: 'Failed to load coupon codes', color: 'error' })
    } finally {
      loading.value = false
    }
  }

  const openAddModal = () => {
    editCoupon.value = null
    formState.Id = undefined
    formState.DiscountId = props.discountId || ''
    formState.CouponCode = ''
    editModalOpen.value = true
  }

  const openEditModal = (coupon: DiscountCouponDto) => {
    editCoupon.value = coupon
    formState.Id = coupon.Id
    formState.DiscountId = coupon.DiscountId
    formState.CouponCode = coupon.CouponCode
    editModalOpen.value = true
  }

  const onSaveCoupon = async () => {
    if (!props.discountId) return

    editLoading.value = true

    try {
      await DiscountService.upsertDiscountCoupon({
        Id: formState.Id,
        DiscountId: props.discountId,
        CouponCode: formState.CouponCode
      })

      toast.add({ title: 'Success', description: 'Coupon saved successfully', color: 'success' })
      editModalOpen.value = false
      await fetchCoupons()
    } catch (error) {
      console.error('Error saving coupon code:', error)
      toast.add({ title: 'Error', description: 'Failed to save coupon', color: 'error' })
    } finally {
      editLoading.value = false
    }
  }

  const deleteCoupon = async (coupon: DiscountCouponDto) => {
    if (!coupon.Id) return

    deleteLoadingId.value = coupon.Id

    try {
      await DiscountService.deleteDiscountCoupon(coupon.Id)
      toast.add({ title: 'Deleted', description: 'Coupon deleted successfully', color: 'success' })
      await fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon code:', error)
      toast.add({ title: 'Error', description: 'Failed to delete coupon', color: 'error' })
    } finally {
      deleteLoadingId.value = null
    }
  }

  const onDeleteClick = (coupon: DiscountCouponDto) => {
    if (coupon.UsageCount > 0) {
      deleteTarget.value = coupon
      deleteModalOpen.value = true
      return
    }

    deleteCoupon(coupon)
  }

  const onConfirmDelete = async () => {
    if (!deleteTarget.value) return

    deleteLoading.value = true

    try {
      await deleteCoupon(deleteTarget.value)
      deleteModalOpen.value = false
      deleteTarget.value = null
    } finally {
      deleteLoading.value = false
    }
  }

  watch(() => props.discountId, () => {
    formState.DiscountId = props.discountId || ''
    fetchCoupons()
  }, { immediate: true })
</script>
